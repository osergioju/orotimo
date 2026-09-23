import { Router } from 'express'
import { subjectsController } from '../controllers/subjects.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const subjectsRoutes = Router()

subjectsRoutes.use(authMiddleware)

subjectsRoutes.get('/', subjectsController.list)
subjectsRoutes.post('/', subjectsController.create)
subjectsRoutes.put('/:id', subjectsController.update)
subjectsRoutes.delete('/:id', subjectsController.remove)
