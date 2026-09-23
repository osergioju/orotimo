import { spawn } from 'node:child_process'
import { writeFile, readFile, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import os from 'node:os'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import { schedulesRepository } from '../repositories/schedules.repository'
import { buildSolverPayload } from './solverPayload.service'

const SOLVER_DIR = process.env.SOLVER_DIR ?? path.resolve(__dirname, '../../../solver')
const PYTHON_BIN = process.env.SOLVER_PYTHON ?? path.join(SOLVER_DIR, 'venv/bin/python3')

interface BridgeSolution {
  datetime: string
  objective_value: number
  visualizacao_escola: Record<string, unknown>[]
  visualizacao_professores: Record<string, unknown>[]
  visualizacao_janelas: Record<string, unknown>[]
  resumo_janelas: Record<string, unknown>[]
}

interface BridgeMessage {
  mensagens: string[]
  dica: string
}

interface BridgeResult {
  status: 'success' | 'infeasible' | 'error'
  messages: BridgeMessage[]
  solutions: BridgeSolution[]
}

function runBridge(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_BIN, ['bridge.py', inputPath, outputPath], { cwd: SOLVER_DIR })

    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('error', (error) => reject(new Error(`Não foi possível iniciar o solver: ${error.message}`)))
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`O solver finalizou com erro (código ${code}): ${stderr.slice(-4000)}`))
    })
  })
}

export const solverService = {
  async generate(scheduleId: string): Promise<BridgeResult> {
    const schedule = await schedulesRepository.findById(scheduleId)
    if (!schedule) throw new NotFoundError('Escala não encontrada')

    await prisma.schedule.update({ where: { id: scheduleId }, data: { status: 'generating' } })

    const tmpBase = path.join(os.tmpdir(), `solver-${scheduleId}-${randomUUID()}`)
    const inputPath = `${tmpBase}-in.json`
    const outputPath = `${tmpBase}-out.json`

    try {
      const payload = await buildSolverPayload(schedule.schoolId)
      await writeFile(inputPath, JSON.stringify(payload))
      await runBridge(inputPath, outputPath)

      const raw = await readFile(outputPath, 'utf-8')
      const result = JSON.parse(raw) as BridgeResult

      if (result.status === 'success') {
        await prisma.$transaction([
          prisma.scheduleSolution.deleteMany({ where: { scheduleId } }),
          ...result.solutions.map((solution) =>
            prisma.scheduleSolution.create({
              data: {
                scheduleId,
                status: 'success',
                visualizacaoEscola: solution.visualizacao_escola as Prisma.InputJsonValue,
                visualizacaoProfessores: solution.visualizacao_professores as Prisma.InputJsonValue,
                visualizacaoJanelas: solution.visualizacao_janelas as Prisma.InputJsonValue,
                resumoJanelas: solution.resumo_janelas as Prisma.InputJsonValue,
              },
            }),
          ),
          prisma.schedule.update({ where: { id: scheduleId }, data: { status: 'generated' } }),
        ])
      } else {
        await prisma.$transaction([
          prisma.scheduleSolution.deleteMany({ where: { scheduleId } }),
          prisma.scheduleSolution.create({
            data: {
              scheduleId,
              status: result.status === 'error' ? 'error' : 'infeasible',
              messages: result.messages as unknown as Prisma.InputJsonValue,
            },
          }),
          prisma.schedule.update({ where: { id: scheduleId }, data: { status: 'failed' } }),
        ])
      }

      return result
    } catch (error) {
      await prisma.schedule.update({ where: { id: scheduleId }, data: { status: 'failed' } })
      throw error
    } finally {
      await Promise.allSettled([unlink(inputPath), unlink(outputPath)])
    }
  },

  async getSolutions(scheduleId: string) {
    return prisma.scheduleSolution.findMany({ where: { scheduleId }, orderBy: { createdAt: 'desc' } })
  },
}
