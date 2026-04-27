import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    getPatient, getConditions, addCondition, getMedications, addMedication, getObservations, addObservation
} from '../../services/doctorApi'
import Layout from '../../components/common/Layout'

import Modal from '../../components/common/Modal'
import PatientHeader from '../../components/patient/PatientHeader'
import ConditionsList from '../../components/patient/ConditionsList'
import MedicationsList from '../../components/patient/MedicationsList'
import ObservationsList from '../../components/patient/ObservationsList'

export default function DoctorPatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [patient, setPatient] = useState(null)
    const [conditions, setConditions] = useState([])
    const [medications, setMedications] = useState([])
    const [observations, setObservations] = useState([])
    const [modal, setModal] = useState(null)

    const [conditionForm, setConditionForm] = useState({ disease_name: '', severity: 'Mild', status: 'active', body_system: '', diagnosed_date: '' })
    const [medicationForm, setMedicationForm] = useState({ medicine_name: '', dosage: '', purpose: '', start_date: '' })
    const [observationForm, setObservationForm] = useState({ test_name: '', value: '', unit: '', is_normal: true, test_date: '' })

    useEffect(() => {
        getPatient(id).then(res => {
            setPatient(res.data)
            getConditions(id).then(res => setConditions(res.data))
            getMedications(id).then(res => setMedications(res.data))
            getObservations(id).then(res => setObservations(res.data))
        }).catch(err => {
            if (err.response?.status === 404) navigate('/not-found')
            else if (err.response?.status === 403) navigate('/unauthorized')
            else navigate('/not-found')
        })
    }, [id, navigate])

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

    if (!patient) return <Layout title="Patient Detail" hasChat><div className="page-body"><p className="text-muted">Loading...</p></div>    
        </Layout>

    return (
        <Layout title={patient.name} breadcrumb={`My Patients / ${patient.name}`} hasChat>
            <div className="page-body">
                <button className="btn btn-ghost btn-sm mb-5" onClick={() => navigate('/doctor/patients')}>← Back to Patients</button>

                <PatientHeader profile={patient} />
                
                <ConditionsList conditions={conditions} showAddButton={true} onAdd={() => setModal('condition')} />
                
                <div className="data-grid" style={{ marginTop: '20px' }}>
                    <MedicationsList medications={medications} showAddButton={true} onAdd={() => setModal('medication')} />
                    <ObservationsList observations={observations} showAddButton={true} onAdd={() => setModal('observation')} />
                </div>
            </div>

            {/* Modals */}
            {modal === 'condition' && (
                <Modal title="Add Condition" onClose={() => setModal(null)} onSubmit={handleAddCondition}>
                    <div className="form-group"><label className="form-label">Disease Name</label><input className="form-input" value={conditionForm.disease_name} onChange={e => setConditionForm({ ...conditionForm, disease_name: e.target.value })} required /></div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Severity</label><select className="form-select" value={conditionForm.severity} onChange={e => setConditionForm({ ...conditionForm, severity: e.target.value })}><option>Mild</option><option>Moderate</option><option>Severe</option><option>Critical</option></select></div>
                        <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={conditionForm.status} onChange={e => setConditionForm({ ...conditionForm, status: e.target.value })}><option value="active">Active</option><option value="resolved">Resolved</option></select></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Body System</label><input className="form-input" value={conditionForm.body_system} onChange={e => setConditionForm({ ...conditionForm, body_system: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Diagnosed Date</label><input className="form-input" type="date" value={conditionForm.diagnosed_date} onChange={e => setConditionForm({ ...conditionForm, diagnosed_date: e.target.value })} /></div>
                    </div>
                </Modal>
            )}

            {modal === 'medication' && (
                <Modal title="Add Medication" onClose={() => setModal(null)} onSubmit={handleAddMedication}>
                    <div className="form-group"><label className="form-label">Medicine</label><input className="form-input" value={medicationForm.medicine_name} onChange={e => setMedicationForm({ ...medicationForm, medicine_name: e.target.value })} required /></div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Dosage</label><input className="form-input" value={medicationForm.dosage} onChange={e => setMedicationForm({ ...medicationForm, dosage: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Since</label><input className="form-input" type="date" value={medicationForm.start_date} onChange={e => setMedicationForm({ ...medicationForm, start_date: e.target.value })} /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Purpose</label><input className="form-input" value={medicationForm.purpose} onChange={e => setMedicationForm({ ...medicationForm, purpose: e.target.value })} /></div>
                </Modal>
            )}

            {modal === 'observation' && (
                <Modal title="Add Observation" onClose={() => setModal(null)} onSubmit={handleAddObservation}>
                    <div className="form-group"><label className="form-label">Test Name</label><input className="form-input" value={observationForm.test_name} onChange={e => setObservationForm({ ...observationForm, test_name: e.target.value })} required /></div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Value</label><input className="form-input" value={observationForm.value} onChange={e => setObservationForm({ ...observationForm, value: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Unit</label><input className="form-input" value={observationForm.unit} onChange={e => setObservationForm({ ...observationForm, unit: e.target.value })} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={observationForm.test_date} onChange={e => setObservationForm({ ...observationForm, test_date: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Is Normal?</label><select className="form-select" value={observationForm.is_normal} onChange={e => setObservationForm({ ...observationForm, is_normal: e.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></div>
                    </div>
                </Modal>
            )}
        </Layout>
    )
}
