import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    getPatient,
    getConditions,   addCondition,
    getMedications,  addMedication,
    getObservations, addObservation,
} from '../services/doctorApi'
import Layout from '../components/Layout'
import ChatBot from '../components/ChatBot'

const SEVERITY_BADGE = { Mild: 'badge-success', Moderate: 'badge-warning', Severe: 'badge-danger', Critical: 'badge-danger' }
const STATUS_BADGE   = { active: 'badge-success', resolved: 'badge-gray' }

function Modal({ title, onClose, onSubmit, children }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={onSubmit}>
                    {children}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function DoctorPatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [patient,      setPatient]      = useState(null)
    const [conditions,   setConditions]   = useState([])
    const [medications,  setMedications]  = useState([])
    const [observations, setObservations] = useState([])

    const [modal, setModal] = useState(null) // 'condition' | 'medication' | 'observation' | null

    const [conditionForm,   setConditionForm]   = useState({ disease_name: '', severity: 'Mild', status: 'active', body_system: '', diagnosed_date: '' })
    const [medicationForm,  setMedicationForm]  = useState({ medicine_name: '', dosage: '', purpose: '', start_date: '' })
    const [observationForm, setObservationForm] = useState({ test_name: '', value: '', unit: '', is_normal: true, test_date: '' })

    useEffect(() => {
        getPatient(id).then(res => setPatient(res.data))
        getConditions(id).then(res => setConditions(res.data))
        getMedications(id).then(res => setMedications(res.data))
        getObservations(id).then(res => setObservations(res.data))
    }, [id])

    const handleAddCondition = async (e) => {
        e.preventDefault()
        await addCondition(id, conditionForm)
        setConditions((await getConditions(id)).data)
        setModal(null)
        setConditionForm({ disease_name: '', severity: 'Mild', status: 'active', body_system: '', diagnosed_date: '' })
    }

    const handleAddMedication = async (e) => {
        e.preventDefault()
        await addMedication(id, medicationForm)
        setMedications((await getMedications(id)).data)
        setModal(null)
        setMedicationForm({ medicine_name: '', dosage: '', purpose: '', start_date: '' })
    }

    const handleAddObservation = async (e) => {
        e.preventDefault()
        await addObservation(id, observationForm)
        setObservations((await getObservations(id)).data)
        setModal(null)
        setObservationForm({ test_name: '', value: '', unit: '', is_normal: true, test_date: '' })
    }

    if (!patient) return (
        <Layout title="Patient Detail" hasChat>
            <div className="page-body"><p className="text-muted">Loading...</p></div>
        </Layout>
    )

    const initials = patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
        <Layout
            title={patient.name}
            breadcrumb={`My Patients / ${patient.name}`}
            hasChat
        >
            <div className="page-body">
                {/* Back button */}
                <button className="btn btn-ghost btn-sm mb-5" onClick={() => navigate('/doctor/patients')}>
                    ← Back to Patients
                </button>

                {/* Patient header */}
                <div className="patient-header mb-5">
                    <div className="patient-avatar">{initials}</div>
                    <div className="patient-info">
                        <h2>{patient.name}</h2>
                        <div className="patient-meta">
                            <span className="patient-meta-item">🪪 MRN: <strong>{patient.mrn}</strong></span>
                            <span className="patient-meta-item">⚧ {patient.gender}</span>
                            {patient.dob  && <span className="patient-meta-item">🎂 {patient.dob}</span>}
                            {patient.phone && <span className="patient-meta-item">📞 {patient.phone}</span>}
                            {patient.email && <span className="patient-meta-item">✉️ {patient.email}</span>}
                        </div>
                    </div>
                </div>

                {/* Conditions — full width */}
                <div className="card data-full">
                    <div className="card-header">
                        <span className="card-title">🩺 Conditions</span>
                        <button className="btn btn-primary btn-sm" onClick={() => setModal('condition')}>+ Add</button>
                    </div>
                    <div className="card-body table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Disease</th><th>Body System</th>
                                    <th>Severity</th><th>Status</th><th>Diagnosed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conditions.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><span>🩺</span><p>No conditions recorded</p></div></td></tr>
                                ) : conditions.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 500 }}>{c.disease_name}</td>
                                        <td>{c.body_system}</td>
                                        <td><span className={`badge ${SEVERITY_BADGE[c.severity] || 'badge-gray'}`}>{c.severity}</span></td>
                                        <td><span className={`badge ${STATUS_BADGE[c.status] || 'badge-gray'}`}>{c.status}</span></td>
                                        <td className="text-muted">{c.diagnosed_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Medications + Observations — 2 columns */}
                <div className="data-grid">
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">💊 Medications</span>
                            <button className="btn btn-primary btn-sm" onClick={() => setModal('medication')}>+ Add</button>
                        </div>
                        <div className="card-body table-wrapper">
                            <table>
                                <thead><tr><th>Medicine</th><th>Dosage</th><th>Purpose</th><th>Since</th></tr></thead>
                                <tbody>
                                    {medications.length === 0 ? (
                                        <tr><td colSpan={4}><div className="empty-state"><span>💊</span><p>No medications</p></div></td></tr>
                                    ) : medications.map(m => (
                                        <tr key={m.id}>
                                            <td style={{ fontWeight: 500 }}>{m.medicine_name}</td>
                                            <td>{m.dosage}</td>
                                            <td className="text-muted">{m.purpose}</td>
                                            <td className="text-muted">{m.start_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🔬 Observations</span>
                            <button className="btn btn-primary btn-sm" onClick={() => setModal('observation')}>+ Add</button>
                        </div>
                        <div className="card-body table-wrapper">
                            <table>
                                <thead><tr><th>Test</th><th>Value</th><th>Unit</th><th>Normal</th><th>Date</th></tr></thead>
                                <tbody>
                                    {observations.length === 0 ? (
                                        <tr><td colSpan={5}><div className="empty-state"><span>🔬</span><p>No observations</p></div></td></tr>
                                    ) : observations.map(o => (
                                        <tr key={o.id}>
                                            <td style={{ fontWeight: 500 }}>{o.test_name}</td>
                                            <td>{o.value}</td>
                                            <td className="text-muted">{o.unit}</td>
                                            <td>
                                                <span className={`badge ${o.is_normal ? 'badge-success' : 'badge-danger'}`}>
                                                    {o.is_normal ? '✓ Yes' : '✗ No'}
                                                </span>
                                            </td>
                                            <td className="text-muted">{o.test_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {modal === 'condition' && (
                <Modal title="Add Condition" onClose={() => setModal(null)} onSubmit={handleAddCondition}>
                    <div className="form-group">
                        <label className="form-label">Disease Name</label>
                        <input className="form-input" placeholder="e.g. Hypertension"
                            value={conditionForm.disease_name}
                            onChange={e => setConditionForm({ ...conditionForm, disease_name: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Severity</label>
                            <select className="form-select" value={conditionForm.severity}
                                onChange={e => setConditionForm({ ...conditionForm, severity: e.target.value })}>
                                <option>Mild</option><option>Moderate</option><option>Severe</option><option>Critical</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={conditionForm.status}
                                onChange={e => setConditionForm({ ...conditionForm, status: e.target.value })}>
                                <option value="active">Active</option><option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Body System</label>
                            <input className="form-input" placeholder="e.g. Cardiovascular"
                                value={conditionForm.body_system}
                                onChange={e => setConditionForm({ ...conditionForm, body_system: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Diagnosed Date</label>
                            <input className="form-input" type="date" value={conditionForm.diagnosed_date}
                                onChange={e => setConditionForm({ ...conditionForm, diagnosed_date: e.target.value })} />
                        </div>
                    </div>
                </Modal>
            )}

            {modal === 'medication' && (
                <Modal title="Add Medication" onClose={() => setModal(null)} onSubmit={handleAddMedication}>
                    <div className="form-group">
                        <label className="form-label">Medicine Name</label>
                        <input className="form-input" placeholder="e.g. Lisinopril 10mg"
                            value={medicationForm.medicine_name}
                            onChange={e => setMedicationForm({ ...medicationForm, medicine_name: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Dosage</label>
                            <input className="form-input" placeholder="e.g. Once daily"
                                value={medicationForm.dosage}
                                onChange={e => setMedicationForm({ ...medicationForm, dosage: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input className="form-input" type="date" value={medicationForm.start_date}
                                onChange={e => setMedicationForm({ ...medicationForm, start_date: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Purpose</label>
                        <input className="form-input" placeholder="e.g. Blood pressure control"
                            value={medicationForm.purpose}
                            onChange={e => setMedicationForm({ ...medicationForm, purpose: e.target.value })} />
                    </div>
                </Modal>
            )}

            {modal === 'observation' && (
                <Modal title="Add Observation" onClose={() => setModal(null)} onSubmit={handleAddObservation}>
                    <div className="form-group">
                        <label className="form-label">Test Name</label>
                        <input className="form-input" placeholder="e.g. Blood Pressure"
                            value={observationForm.test_name}
                            onChange={e => setObservationForm({ ...observationForm, test_name: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Value</label>
                            <input className="form-input" placeholder="e.g. 120/80"
                                value={observationForm.value}
                                onChange={e => setObservationForm({ ...observationForm, value: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Unit</label>
                            <input className="form-input" placeholder="e.g. mmHg"
                                value={observationForm.unit}
                                onChange={e => setObservationForm({ ...observationForm, unit: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Test Date</label>
                            <input className="form-input" type="date" value={observationForm.test_date}
                                onChange={e => setObservationForm({ ...observationForm, test_date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Normal?</label>
                            <select className="form-select" value={observationForm.is_normal}
                                onChange={e => setObservationForm({ ...observationForm, is_normal: e.target.value === 'true' })}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            <ChatBot patientId={id} />
        </Layout>
    )
}

export default DoctorPatientDetail
