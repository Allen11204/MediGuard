import { useState, useEffect } from 'react'
import { getMyProfile, getMyConditions, getMyMedications, getMyObservations } from '../../services/patientApi'
import Layout from '../../components/common/Layout'
import ChatBot from '../../components/chat/ChatBot'
import PatientHeader from '../../components/patient/PatientHeader'
import ConditionsList from '../../components/patient/ConditionsList'
import MedicationsList from '../../components/patient/MedicationsList'
import ObservationsList from '../../components/patient/ObservationsList'

export default function PatientDashboard() {
    const [profile, setProfile] = useState(null)
    const [conditions, setConditions] = useState([])
    const [medications, setMedications] = useState([])
    const [observations, setObservations] = useState([])

    useEffect(() => {
        getMyProfile().then(res => setProfile(res.data))
        getMyConditions().then(res => setConditions(res.data))
        getMyMedications().then(res => setMedications(res.data))
        getMyObservations().then(res => setObservations(res.data))
    }, [])

    if (!profile) return (
        <Layout title="My Dashboard" hasChat>
            <div className="page-body"><p className="text-muted">Loading...</p></div>
            <ChatBot />
        </Layout>
    )

    return (
        <Layout title="My Dashboard" hasChat>
            <div className="page-body">
                <PatientHeader profile={profile} />
                <ConditionsList conditions={conditions} showAddButton={false} />
                
                <div className="data-grid" style={{ marginTop: '20px' }}>
                    <MedicationsList medications={medications} showAddButton={false} />
                    <ObservationsList observations={observations} showAddButton={false} />
                </div>
            </div>
        </Layout>
    )
}
