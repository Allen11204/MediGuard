import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, createUser, deleteUser } from '../services/adminApi'

function AdminUsers() {
    const [users, setUsers] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'Patient' })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        getUsers().then(res => setUsers(res.data))
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await createUser(form)
            const res = await getUsers()
            setUsers(res.data)
            setShowForm(false)
            setForm({ username: '', email: '', password: '', role: 'Patient' })
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user')
        }
    }

    const handleDelete = async (userId) => {
        await deleteUser(userId)
        setUsers(users.filter(u => u.id !== userId))
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        navigate('/login')
    }

    return (
        <div>
            <div>
                <h2>User Management</h2>
                <button onClick={() => navigate('/admin/audit-logs')}>Audit Logs</button>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button onClick={() => setShowForm(!showForm)}>Add User</button>
            {showForm && (
                <form onSubmit={handleCreate}>
                    <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                    <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                        <option value="Patient">Patient</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </form>
            )}

            <table>
                <thead>
                    <tr><th>Username</th><th>Email</th><th>Role</th><th>Active</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.is_active ? 'Yes' : 'No'}</td>
                            <td>
                                <button onClick={() => handleDelete(u.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminUsers
