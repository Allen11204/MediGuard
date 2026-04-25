import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    getPatient,
    getConditions, addCondition,
    getMedications, addMedication,
    getObservations, addObservation
} from '../services/doctorApi'

function DoctorPatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [patient, setPatient] = useState(null)
    const [conditions, setConditions] = useState([])
    const [medications, setMedications] = useState([])
    const [observations, setObservations] = useState([])

    const [showConditionForm, setShowConditionForm] = useState(false)
    const [showMedicationForm, setShowMedicationForm] = useState(false)
    const [showObservationForm, setShowObservationForm] = useState(false)

    const [conditionForm, setConditionForm] = useState({ disease_name: '', severity: '', status: '', body_system: '', diagnosed_date: '' })
    const [medicationForm, setMedicationForm] = useState({ medicine_name: '', dosage: '', purpose: '', start_date: '' })
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
        const res = await getConditions(id)
        setConditions(res.data)
        setShowConditionForm(false)
        setConditionForm({ disease_name: '', severity: '', status: '', body_system: '', diagnosed_date: '' })
    }

    const handleAddMedication = async (e) => {
        e.preventDefault()
        await addMedication(id, medicationForm)
        const res = await getMedications(id)
        setMedications(res.data)
        setShowMedicationForm(false)
        setMedicationForm({ medicine_name: '', dosage: '', purpose: '', start_date: '' })
    }

    const handleAddObservation = async (e) => {
        e.preventDefault()
        await addObservation(id, observationForm)
        const res = await getObservations(id)
        setObservations(res.data)
        setShowObservationForm(false)
        setObservationForm({ test_name: '', value: '', unit: '', is_normal: true, test_date: '' })
    }

    if (!patient) return <div>Loading...</div>

    return (
        <div>
            <button onClick={() => navigate('/doctor/patients')}>Back</button>
            <h2>{patient.name}</h2>
            <p>Gender: {patient.gender} | MRN: {patient.mrn}</p>

            {/* Conditions */}
            <section>
                <h3>Conditions</h3>
                <button onClick={() => setShowConditionForm(!showConditionForm)}>Add Condition</button>
                {showConditionForm && (
                    <form onSubmit={handleAddCondition}>
                        <input placeholder="Disease name" value={conditionForm.disease_name} onChange={e => setConditionForm({ ...conditionForm, disease_name: e.target.value })} />
                        <input placeholder="Severity" value={conditionForm.severity} onChange={e => setConditionForm({ ...conditionForm, severity: e.target.value })} />
                        <input placeholder="Status" value={conditionForm.status} onChange={e => setConditionForm({ ...conditionForm, status: e.target.value })} />
                        <input placeholder="Body system" value={conditionForm.body_system} onChange={e => setConditionForm({ ...conditionForm, body_system: e.target.value })} />
                        <input type="date" value={conditionForm.diagnosed_date} onChange={e => setConditionForm({ ...conditionForm, diagnosed_date: e.target.value })} />
                        <button type="submit">Save</button>
                        <button type="button" onClick={() => setShowConditionForm(false)}>Cancel</button>
                    </form>
                )}
                <table>
                    <thead>
                        <tr><th>Disease</th><th>Severity</th><th>Status</th><th>Body System</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        {conditions.map(c => (
                            <tr key={c.id}>
                                <td>{c.disease_name}</td>
                                <td>{c.severity}</td>
                                <td>{c.status}</td>
                                <td>{c.body_system}</td>
                                <td>{c.diagnosed_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Medications */}
            <section>
                <h3>Medications</h3>
                <button onClick={() => setShowMedicationForm(!showMedicationForm)}>Add Medication</button>
                {showMedicationForm && (
                    <form onSubmit={handleAddMedication}>
                        <input placeholder="Medicine name" value={medicationForm.medicine_name} onChange={e => setMedicationForm({ ...medicationForm, medicine_name: e.target.value })} />
                        <input placeholder="Dosage" value={medicationForm.dosage} onChange={e => setMedicationForm({ ...medicationForm, dosage: e.target.value })} />
                        <input placeholder="Purpose" value={medicationForm.purpose} onChange={e => setMedicationForm({ ...medicationForm, purpose: e.target.value })} />
                        <input type="date" value={medicationForm.start_date} onChange={e => setMedicationForm({ ...medicationForm, start_date: e.target.value })} />
                        <button type="submit">Save</button>
                        <button type="button" onClick={() => setShowMedicationForm(false)}>Cancel</button>
                    </form>
                )}
                <table>
                    <thead>
                        <tr><th>Medicine</th><th>Dosage</th><th>Purpose</th><th>Start Date</th></tr>
                    </thead>
                    <tbody>
                        {medications.map(m => (
                            <tr key={m.id}>
                                <td>{m.medicine_name}</td>
                                <td>{m.dosage}</td>
                                <td>{m.purpose}</td>
                                <td>{m.start_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Observations */}
            <section>
                <h3>Observations</h3>
                <button onClick={() => setShowObservationForm(!showObservationForm)}>Add Observation</button>
                {showObservationForm && (
                    <form onSubmit={handleAddObservation}>
                        <input placeholder="Test name" value={observationForm.test_name} onChange={e => setObservationForm({ ...observationForm, test_name: e.target.value })} />
                        <input placeholder="Value" value={observationForm.value} onChange={e => setObservationForm({ ...observationForm, value: e.target.value })} />
                        <input placeholder="Unit" value={observationForm.unit} onChange={e => setObservationForm({ ...observationForm, unit: e.target.value })} />
                        <input type="date" value={observationForm.test_date} onChange={e => setObservationForm({ ...observationForm, test_date: e.target.value })} />
                        <button type="submit">Save</button>
                        <button type="button" onClick={() => setShowObservationForm(false)}>Cancel</button>
                    </form>
                )}
                <table>
                    <thead>
                        <tr><th>Test</th><th>Value</th><th>Unit</th><th>Normal</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        {observations.map(o => (
                            <tr key={o.id}>
                                <td>{o.test_name}</td>
                                <td>{o.value}</td>
                                <td>{o.unit}</td>
                                <td>{o.is_normal ? 'Yes' : 'No'}</td>
                                <td>{o.test_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    )
}

export default DoctorPatientDetail
