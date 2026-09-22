import { Router } from 'express'
import { adminController } from '../controllers/admin.controller'

export const adminRoutes = Router()

adminRoutes.get('/users', adminController.listUsers)
adminRoutes.get('/systems', adminController.listSystems)
adminRoutes.get('/schools', adminController.listSchools)
adminRoutes.get('/users/:userId/permissions', adminController.getUserPermissions)
adminRoutes.put('/users/:userId/permissions', adminController.updateUserPermissions)
