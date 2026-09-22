import { Router } from 'express'
import { schoolsController } from '../controllers/schools.controller'

export const schoolsRoutes = Router()

schoolsRoutes.get('/', schoolsController.list)
schoolsRoutes.post('/', schoolsController.create)
schoolsRoutes.get('/:id', schoolsController.getById)
schoolsRoutes.get('/:id/dashboard', schoolsController.getDashboard)
