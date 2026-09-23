import { prisma } from '../lib/prisma'
import { ForbiddenError, NotFoundError } from '../lib/errors'

/**
 * Garante que `userId` tem acesso à escola `schoolId` — dono OU membro
 * (`SchoolMember`, gerenciado pelo Admin Master). Lança 404 se a escola não
 * existir e 403 se existir mas o usuário não tiver acesso — evitando que um
 * token válido de qualquer conta leia/altere dados de outra escola.
 */
export const accessService = {
  async assertSchoolOwnership(schoolId: string, userId: string) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } })

    if (!school) {
      throw new NotFoundError('Escola não encontrada')
    }

    if (school.ownerId === userId) {
      return school
    }

    const membership = await prisma.schoolMember.findUnique({
      where: { schoolId_userId: { schoolId, userId } },
    })

    if (!membership) {
      throw new ForbiddenError()
    }

    return school
  },
}
