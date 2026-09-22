import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { systemsRoutes } from './systems.routes'
import { schoolsRoutes } from './schools.routes'
import { schedulesRoutes } from './schedules.routes'
import { adminRoutes } from './admin.routes'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/systems', systemsRoutes)
routes.use('/schools', schoolsRoutes)
routes.use('/schedules', schedulesRoutes)
routes.use('/admin', adminRoutes)
