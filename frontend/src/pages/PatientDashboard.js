import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, getMyConditions, getMyMedications, getMyObservations } from '../services/patientApi'
import ChatBot from '../components/ChatBot'

function PatientDashboard() {
    const [profile, setProfile] = useState(null)
    const [conditions, setConditions] = useState([])
    const [medications, setMedications] = useState([])
    const [observations, setObservations] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getMyProfile().then(res => setProfile(res.data))
        getMyConditions().then(res => setConditions(res.data))
        getMyMedications().then(res => setMedications(res.data))
        getMyObservations().then(res => setObservations(res.data))
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        navigate('/login')
    }

    if (!profile) return <div>Loading...</div>

    return (
        <div>
            <div>
                <h2>My Dashboard</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {/* Profile */}
            <section>
                <h3>My Profile</h3>
                <p>Name: {profile.name}</p>
                <p>Gender: {profile.gender}</p>
                <p>MRN: {profile.mrn}</p>
            </section>

            {/* Conditions */}
            <section>
                <h3>My Conditions</h3>
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
                <h3>My Medications</h3>
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
                <h3>My Observations</h3>
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
            <ChatBot patientId={null} />
        </div>
    )
}

export default PatientDashboard
