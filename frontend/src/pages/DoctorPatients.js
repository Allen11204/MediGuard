import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyPatients } from '../services/doctorApi'

function DoctorPatients() {
    const [patients, setPatients] = useState([])
    const [search, setSearch] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        getMyPatients()
            .then(res => setPatients(res.data))
            .catch(() => setError('Failed to load patients'))
    }, [])

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        navigate('/login')
    }

    return (
        <div>
            <div>
                <h2>My Patients</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>MRN</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.gender}</td>
                            <td>{p.mrn}</td>
                            <td>
                                <button onClick={() => navigate(`/doctor/patients/${p.id}`)}>
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default DoctorPatients
