import { Router } from 'express'
import { teachersController } from '../controllers/teachers.controller'
import { availabilityController } from '../controllers/availability.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const teachersRoutes = Router()

teachersRoutes.use(authMiddleware)

teachersRoutes.get('/', teachersController.list)
teachersRoutes.post('/', teachersController.create)
teachersRoutes.get('/:id', teachersController.getById)
teachersRoutes.put('/:id', teachersController.update)
teachersRoutes.delete('/:id', teachersController.remove)
teachersRoutes.get('/:teacherId/availability', availabilityController.get)
teachersRoutes.put('/:teacherId/availability', availabilityController.replace)
