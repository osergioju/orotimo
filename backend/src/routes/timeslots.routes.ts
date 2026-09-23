import { Router } from 'express'
import { timeSlotsController } from '../controllers/timeslots.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const timeSlotsRoutes = Router()

timeSlotsRoutes.use(authMiddleware)

timeSlotsRoutes.get('/', timeSlotsController.list)
timeSlotsRoutes.post('/', timeSlotsController.create)
timeSlotsRoutes.delete('/:id', timeSlotsController.remove)
