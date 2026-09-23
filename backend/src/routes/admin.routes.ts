import { Router } from 'express'
import { adminController } from '../controllers/admin.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { adminMiddleware } from '../middlewares/admin.middleware'

export const adminRoutes = Router()

adminRoutes.use(authMiddleware)
adminRoutes.use(adminMiddleware)

adminRoutes.get('/stats', adminController.getStats)

adminRoutes.get('/users', adminController.listUsers)
adminRoutes.post('/users', adminController.createUser)
adminRoutes.get('/users/:userId/permissions', adminController.getUserPermissions)
adminRoutes.put('/users/:userId/permissions', adminController.updateUserPermissions)

adminRoutes.get('/systems', adminController.listSystems)

adminRoutes.get('/schools', adminController.listSchools)
adminRoutes.get('/schools/:schoolId/members', adminController.listSchoolMembers)
adminRoutes.post('/schools/:schoolId/members', adminController.addSchoolMember)
adminRoutes.delete('/schools/:schoolId/members/:userId', adminController.removeSchoolMember)
