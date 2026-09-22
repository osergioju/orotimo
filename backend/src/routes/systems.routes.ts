import { Router } from 'express'
import { systemsController } from '../controllers/systems.controller'

export const systemsRoutes = Router()

systemsRoutes.get('/', systemsController.list)
