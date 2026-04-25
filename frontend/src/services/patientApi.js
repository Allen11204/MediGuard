import api from './api'

export const getMyProfile = () =>
    api.get('/api/my/profile')

export const getMyConditions = () =>
    api.get('/api/my/conditions')

export const getMyMedications = () =>
    api.get('/api/my/medications')

export const getMyObservations = () =>
    api.get('/api/my/observations')
