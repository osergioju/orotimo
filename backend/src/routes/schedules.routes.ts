import { Router } from 'express'
import { schedulesController } from '../controllers/schedules.controller'

export const schedulesRoutes = Router()

schedulesRoutes.get('/', schedulesController.list)
schedulesRoutes.get('/:id', schedulesController.getById)
