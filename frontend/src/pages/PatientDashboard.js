import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, getMyConditions, getMyMedications, getMyObservations } from '../services/patientApi'
import Layout from '../components/Layout'

const SEVERITY_BADGE = { Mild: 'badge-success', Moderate: 'badge-warning', Severe: 'badge-danger', Critical: 'badge-danger' }
const STATUS_BADGE   = { active: 'badge-success', resolved: 'badge-gray' }

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

    if (!profile) return (
        <Layout title="My Dashboard" hasChat>
            <div className="page-body"><p className="text-muted">Loading...</p></div>
        </Layout>
    )

    const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
        <Layout title="My Dashboard" hasChat>
            <div className="page-body">
                {/* Profile header */}
                <div className="patient-header mb-5">
                    <div className="patient-avatar">{initials}</div>
                    <div className="patient-info">
                        <h2>{profile.name}</h2>
                        <div className="patient-meta">
                            <span className="patient-meta-item">🪪 MRN: <strong>{profile.mrn}</strong></span>
                            <span className="patient-meta-item">⚧ {profile.gender}</span>
                            {profile.dob  && <span className="patient-meta-item">🎂 {profile.dob}</span>}
                            {profile.phone && <span className="patient-meta-item">📞 {profile.phone}</span>}
                            {profile.email && <span className="patient-meta-item">✉️ {profile.email}</span>}
                        </div>
                    </div>
                </div>

                {/* Conditions */}
                <div className="card data-full">
                    <div className="card-header">
                        <span className="card-title">🩺 My Conditions</span>
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

                {/* Medications + Observations */}
                <div className="data-grid">
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">💊 My Medications</span>
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
                            <span className="card-title">🔬 My Observations</span>
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
        </Layout>
    )
}

export default PatientDashboard
