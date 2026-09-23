import { Router } from 'express'
import { classesController } from '../controllers/classes.controller'
import { classAvailabilityController } from '../controllers/classAvailability.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const classesRoutes = Router()

classesRoutes.use(authMiddleware)

classesRoutes.get('/', classesController.list)
classesRoutes.post('/', classesController.create)
classesRoutes.put('/:id', classesController.update)
classesRoutes.delete('/:id', classesController.remove)
classesRoutes.get('/:classId/availability', classAvailabilityController.get)
classesRoutes.put('/:classId/availability', classAvailabilityController.replace)
