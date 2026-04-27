const SEVERITY_BADGE = { Mild: 'badge-success', Moderate: 'badge-warning', Severe: 'badge-danger', Critical: 'badge-danger' }
const STATUS_BADGE   = { active: 'badge-success', resolved: 'badge-gray' }

export default function ConditionsList({ conditions, onAdd, showAddButton }) {
    if (!conditions) conditions = []
    
    return (
        <div className="card data-full">
            <div className="card-header">
                <span className="card-title">🩺 Conditions</span>
                {showAddButton && <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add</button>}
            </div>
            <div className="card-body table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Disease</th><th>Body System</th>
                            <th>Severity</th><th>Status</th><th>Diagnosed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conditions.length === 0 ? (
                            <tr><td colSpan={5}><div className="empty-state"><span>🩺</span><p>No conditions recorded</p></div></td></tr>
                        ) : conditions.map(c => (
                            <tr key={c.id}>
                                <td style={{ fontWeight: 500 }}>{c.disease_name}</td>
                                <td>{c.body_system}</td>
                                <td><span className={`badge ${SEVERITY_BADGE[c.severity] || 'badge-gray'}`}>{c.severity}</span></td>
                                <td><span className={`badge ${STATUS_BADGE[c.status] || 'badge-gray'}`}>{c.status}</span></td>
                                <td className="text-muted">{c.diagnosed_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
