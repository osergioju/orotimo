import { prisma } from '../lib/prisma'
import { ForbiddenError, NotFoundError } from '../lib/errors'

/**
 * Garante que `userId` é o dono da escola `schoolId`. Lança 404 se a escola
 * não existir e 403 se existir mas pertencer a outro usuário — evitando que
 * um token válido de qualquer conta leia/altere dados de outra escola.
 */
export const accessService = {
  async assertSchoolOwnership(schoolId: string, userId: string) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } })

    if (!school) {
      throw new NotFoundError('Escola não encontrada')
    }

    if (school.ownerId !== userId) {
      throw new ForbiddenError()
    }

    return school
  },
}
