import { Router } from 'express'
import { schedulesController } from '../controllers/schedules.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const schedulesRoutes = Router()

schedulesRoutes.use(authMiddleware)

schedulesRoutes.get('/', schedulesController.list)
schedulesRoutes.post('/', schedulesController.create)
schedulesRoutes.get('/:id', schedulesController.getById)
schedulesRoutes.patch('/:id/status', schedulesController.updateStatus)
schedulesRoutes.post('/:id/generate', schedulesController.generate)
schedulesRoutes.get('/:id/solutions', schedulesController.getSolutions)
