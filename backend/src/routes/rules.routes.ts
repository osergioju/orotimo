import { Router } from 'express'
import { rulesController } from '../controllers/rules.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const rulesRoutes = Router()

rulesRoutes.use(authMiddleware)

rulesRoutes.get('/', rulesController.list)
rulesRoutes.post('/', rulesController.create)
rulesRoutes.delete('/:id', rulesController.remove)
