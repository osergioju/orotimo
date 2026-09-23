export class AppError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = new.target.name
    this.status = status
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Requisição inválida') {
    super(message, 400)
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('E-mail ou senha inválidos', 401)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Você não tem acesso a este recurso') {
    super(message, 403)
  }
}
