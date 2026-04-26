import api from './api'

export const sendMessage = (patientId, message, history) =>
    api.post('/api/llm/chat', { patient_id: patientId, message, history })
