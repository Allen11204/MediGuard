import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/authApi'

function Register() {
    const [form, setForm]       = useState({ username: '', email: '', password: '', role: 'Patient' })
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(form.username, form.email, form.password, form.role)
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>Medi<span>Guard</span></h1>
                    <p>Create your account</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="form-input" type="text" placeholder="Choose a username"
                            value={form.username} onChange={set('username')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="your@email.com"
                            value={form.email} onChange={set('email')} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" placeholder="Password"
                                value={form.password} onChange={set('password')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select className="form-select" value={form.role} onChange={set('role')}>
                                <option value="Patient">Patient</option>
                                <option value="Doctor">Doctor</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn btn-primary w-full" type="submit" disabled={loading}
                        style={{ justifyContent: 'center', height: 44, fontSize: 15, marginTop: 8 }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}
                        style={{ border: 'none', padding: '0 4px', color: 'var(--primary)', fontWeight: 600 }}>
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Register
