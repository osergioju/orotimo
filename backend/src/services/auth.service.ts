import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { usersRepository } from '../repositories/users.repository'
import { InvalidCredentialsError } from '../lib/errors'

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d'

export const authService = {
  async login(email: string, password: string) {
    const user = await usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
    const { passwordHash: _passwordHash, ...publicUser } = user

    return { user: publicUser, token }
  },
}
