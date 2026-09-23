import { Router } from 'express'
import { assignmentsController } from '../controllers/assignments.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const assignmentsRoutes = Router()

assignmentsRoutes.use(authMiddleware)

assignmentsRoutes.get('/', assignmentsController.list)
assignmentsRoutes.post('/', assignmentsController.create)
assignmentsRoutes.put('/:id', assignmentsController.update)
assignmentsRoutes.delete('/:id', assignmentsController.remove)
