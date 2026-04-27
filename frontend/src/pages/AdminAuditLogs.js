import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuditLogs } from '../services/adminApi'
import Layout from '../components/Layout'

function AdminAuditLogs() {
    const [logs, setLogs] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getAuditLogs().then(res => setLogs(res.data))
    }, [])

    return (
        <Layout title="System Audit Logs" breadcrumb="Admin / Audit Logs" hasChat={false}>
            <div className="page-body">
                <div className="card data-full">
                    <div className="card-header">
                        <span className="card-title">📜 Audit Logs</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')}>
                            ← Back to Users
                        </button>
                    </div>
                    <div className="card-body table-wrapper">
                        <table>
                            <thead>
                                <tr><th>User ID</th><th>Action</th><th>Resource</th><th>Outcome</th><th>IP</th><th>Time</th></tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr><td colSpan={6}><div className="empty-state"><span>📜</span><p>No audit logs found</p></div></td></tr>
                                ) : logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{log.user_id}</td>
                                        <td><span className="badge badge-gray">{log.action}</span></td>
                                        <td>{log.resource_type}</td>
                                        <td>
                                            <span className={`badge ${log.outcome === 'success' ? 'badge-success' : 'badge-danger'}`}>
                                                {log.outcome}
                                            </span>
                                        </td>
                                        <td className="text-muted">{log.source_ip}</td>
                                        <td className="text-muted">{log.timestamp}</td>
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

export default AdminAuditLogs
