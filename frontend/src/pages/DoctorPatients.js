import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyPatients } from '../services/doctorApi'
import Layout from '../components/Layout'

function DoctorPatients() {
    const [patients, setPatients] = useState([])
    const [search, setSearch]     = useState('')
    const [error, setError]       = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        getMyPatients()
            .then(res => setPatients(res.data))
            .catch(() => setError('Failed to load patients'))
    }, [])

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.mrn.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Layout title="My Patients" breadcrumb={`${patients.length} patients assigned`}>
            <div className="page-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Patient List</span>
                        <div className="search-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Search by name or MRN..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="card-body table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>MRN</th>
                                    <th>Gender</th>
                                    <th>Date of Birth</th>
                                    <th>Contact</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="empty-state">
                                                <span>👥</span>
                                                <p>No patients found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(p => (
                                    <tr key={p.id} className="clickable"
                                        onClick={() => navigate(`/doctor/patients/${p.id}`)}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                                    color: '#fff', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontWeight: 700, fontSize: 13,
                                                    flexShrink: 0
                                                }}>
                                                    {p.name[0]}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{p.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="font-mono text-sm">{p.mrn}</span></td>
                                        <td>{p.gender}</td>
                                        <td>{p.dob || '—'}</td>
                                        <td className="text-muted">{p.phone || '—'}</td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm"
                                                onClick={e => { e.stopPropagation(); navigate(`/doctor/patients/${p.id}`) }}>
                                                View →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default DoctorPatients
