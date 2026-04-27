import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/authApi'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await login(username, password)
            const { token, role } = res.data
            localStorage.setItem('token', token)
            localStorage.setItem('role', role)
            // decode username from JWT payload
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                localStorage.setItem('username', payload.username || username)
            } catch {
                localStorage.setItem('username', username)
            }

            if (role === 'Doctor')  navigate('/doctor/patients')
            else if (role === 'Patient') navigate('/patient/dashboard')
            else if (role === 'Admin')   navigate('/admin/users')
        } catch {
            setError('Invalid username or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>Medi<span>Guard</span></h1>
                    <p>Clinical Information System</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 24 }}>
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn btn-primary w-full" type="submit" disabled={loading}
                        style={{ justifyContent: 'center', height: 44, fontSize: 15 }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/register')}
                        style={{ border: 'none', padding: '0 4px', color: 'var(--primary)', fontWeight: 600 }}>
                        Register
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Login
