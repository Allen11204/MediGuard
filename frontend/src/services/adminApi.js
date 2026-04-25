import api from './api'

export const getUsers = () =>
    api.get('/api/admin/users')

export const createUser = (data) =>
    api.post('/api/admin/users', data)

export const deleteUser = (userId) =>
    api.delete(`/api/admin/users/${userId}`)

export const getAuditLogs = () =>
    api.get('/api/admin/audit-logs')
