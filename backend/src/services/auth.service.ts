import { usersRepository } from '../repositories/users.repository'

export class InvalidCredentialsError extends Error {
  constructor() {
    super('E-mail ou senha inválidos')
    this.name = 'InvalidCredentialsError'
  }
}

/**
 * Autenticação mockada. A senha não é validada nesta etapa.
 * Estrutura preparada para, futuramente, validar hash de senha e emitir um JWT real.
 */
export const authService = {
  async login(email: string, _password: string) {
    const user = await usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const token = `mock-token.${user.id}`

    return { user, token }
  },
}
