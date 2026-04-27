import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, createUser, deleteUser } from '../../services/adminApi'
import Layout from '../../components/common/Layout'
import Modal from '../../components/common/Modal'


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
            setError('')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user')
        }
    }

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        await deleteUser(userId)
        setUsers(users.filter(u => u.id !== userId))
    }

    return (
        <Layout title="System Users" breadcrumb="Admin / Users" hasChat={false}>
            <div className="page-body">
                {error && <div className="badge badge-danger mb-5" style={{ padding: '10px' }}>{error}</div>}

                <div className="card data-full">
                    <div className="card-header">
                        <span className="card-title">👥 All Users</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/audit-logs')}>View Audit Logs</button>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add User</button>
                        </div>
                    </div>
                    <div className="card-body table-wrapper">
                        <table>
                            <thead>
                                <tr><th>Username</th><th>Email</th><th>Role</th><th>Active</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><span>👥</span><p>No users found</p></div></td></tr>
                                ) : users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 500 }}>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`badge ${u.role === 'Admin' ? 'badge-danger' : u.role === 'Doctor' ? 'badge-primary' : 'badge-success'}`}>{u.role}</span></td>
                                        <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-gray'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showForm && (
                <Modal title="Create User" onClose={() => setShowForm(false)} onSubmit={handleCreate}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="form-input" placeholder="Enter username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="Enter email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Enter password (optional initially)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="Patient">Patient</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </Modal>
            )}
        </Layout>
    )
}

export default AdminUsers
