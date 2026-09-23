import { Router } from 'express'
import { roomsController } from '../controllers/rooms.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const roomsRoutes = Router()

roomsRoutes.use(authMiddleware)

roomsRoutes.get('/', roomsController.list)
roomsRoutes.post('/', roomsController.create)
roomsRoutes.put('/:id', roomsController.update)
roomsRoutes.delete('/:id', roomsController.remove)
