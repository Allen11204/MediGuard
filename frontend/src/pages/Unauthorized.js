import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

function Unauthorized() {
    const navigate = useNavigate()
    const role = localStorage.getItem('role')
    
    const goHome = () => {
        if (role === 'Doctor') navigate('/doctor/patients')
        else if (role === 'Patient') navigate('/patient/dashboard')
        else if (role === 'Admin') navigate('/admin/users')
        else {
            localStorage.clear()
            navigate('/login')
        }
    }

    return (
        <Layout title="403 - Unauthorized Access" hasChat={false}>
            <div className="page-body" style={{ textAlign: 'center', marginTop: '50px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
                <h2>Access Denied</h2>
                <p className="text-muted">You do not have permission to view this page. This action may have been logged.</p>
                <button className="btn btn-primary" onClick={goHome} style={{ marginTop: '20px' }}>
                    Go to My Dashboard
                </button>
            </div>
        </Layout>
    )
}

export default Unauthorized
