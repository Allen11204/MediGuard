import api from './api'

export const login = (username, password) =>
    api.post('/api/auth/login', { username, password })

export const register = (username, email, password, role) =>
    api.post('/api/auth/register', { username, email, password, role })
