import api from './api'

export const getMyPatients = () =>
    api.get('/api/patients')

export const getPatient = (patientId) =>
    api.get(`/api/patients/${patientId}`)

export const getConditions = (patientId) =>
    api.get(`/api/patients/${patientId}/conditions`)

export const addCondition = (patientId, data) =>
    api.post(`/api/patients/${patientId}/conditions`, data)

export const getMedications = (patientId) =>
    api.get(`/api/patients/${patientId}/medications`)

export const addMedication = (patientId, data) =>
    api.post(`/api/patients/${patientId}/medications`, data)

export const getObservations = (patientId) =>
    api.get(`/api/patients/${patientId}/observations`)

export const addObservation = (patientId, data) =>
    api.post(`/api/patients/${patientId}/observations`, data)
