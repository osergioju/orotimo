import { Router } from 'express'
import { schoolsController } from '../controllers/schools.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const schoolsRoutes = Router()

schoolsRoutes.use(authMiddleware)

schoolsRoutes.get('/', schoolsController.list)
schoolsRoutes.post('/', schoolsController.create)
schoolsRoutes.get('/:id', schoolsController.getById)
schoolsRoutes.get('/:id/dashboard', schoolsController.getDashboard)
