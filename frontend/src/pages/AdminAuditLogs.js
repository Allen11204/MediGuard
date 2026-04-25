import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuditLogs } from '../services/adminApi'

function AdminAuditLogs() {
    const [logs, setLogs] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getAuditLogs().then(res => setLogs(res.data))
    }, [])

    return (
        <div>
            <div>
                <h2>Audit Logs</h2>
                <button onClick={() => navigate('/admin/users')}>Users</button>
                <button onClick={() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('role')
                    navigate('/login')
                }}>Logout</button>
            </div>

            <table>
                <thead>
                    <tr><th>User ID</th><th>Action</th><th>Resource</th><th>Outcome</th><th>IP</th><th>Time</th></tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{log.user_id}</td>
                            <td>{log.action}</td>
                            <td>{log.resource_type}</td>
                            <td style={{ color: 'red' }}>{log.outcome}</td>
                            <td>{log.source_ip}</td>
                            <td>{log.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminAuditLogs
