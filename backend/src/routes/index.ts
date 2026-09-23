import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { systemsRoutes } from './systems.routes'
import { schoolsRoutes } from './schools.routes'
import { schedulesRoutes } from './schedules.routes'
import { teachersRoutes } from './teachers.routes'
import { classesRoutes } from './classes.routes'
import { subjectsRoutes } from './subjects.routes'
import { roomsRoutes } from './rooms.routes'
import { timeSlotsRoutes } from './timeslots.routes'
import { rulesRoutes } from './rules.routes'
import { assignmentsRoutes } from './assignments.routes'
import { adminRoutes } from './admin.routes'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/systems', systemsRoutes)
routes.use('/schools', schoolsRoutes)
routes.use('/schedules', schedulesRoutes)
routes.use('/teachers', teachersRoutes)
routes.use('/classes', classesRoutes)
routes.use('/subjects', subjectsRoutes)
routes.use('/rooms', roomsRoutes)
routes.use('/time-slots', timeSlotsRoutes)
routes.use('/rules', rulesRoutes)
routes.use('/assignments', assignmentsRoutes)
routes.use('/admin', adminRoutes)
