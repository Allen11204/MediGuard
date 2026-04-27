import Layout from '../../components/common/Layout'
import { useNavigate } from 'react-router-dom'

function NotFound() {
    const navigate = useNavigate()
    return (
        <Layout title="404 - Page Not Found" hasChat={false}>
            <div className="page-body" style={{ textAlign: 'center', marginTop: '50px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🤷‍♂️</div>
                <h2>404</h2>
                <p className="text-muted">The resource or page you are looking for does not exist.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                    Go to Login
                </button>
            </div>
        </Layout>
    )
}

export default NotFound
