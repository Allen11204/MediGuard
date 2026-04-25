import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authApi'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await login(username, password)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('role', res.data.role)

            if (res.data.role === 'Doctor') navigate('/doctor/patients')
            else if (res.data.role === 'Patient') navigate('/patient/dashboard')
            else if (res.data.role === 'Admin') navigate('/admin/users')
        } catch (err) {
            setError('Invalid username or password')
        }
    }

    return (
        <div>
            <h2>MediGuard Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
                <button type="button" onClick={() => navigate('/register')}>
                    Register
                </button>
            </form>
        </div>
    )
}

export default Login
