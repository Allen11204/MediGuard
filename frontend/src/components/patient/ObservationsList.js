export default function ObservationsList({ observations, onAdd, showAddButton }) {
    if (!observations) observations = []

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">🔬 Observations</span>
                {showAddButton && <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add</button>}
            </div>
            <div className="card-body table-wrapper">
                <table>
                    <thead><tr><th>Test</th><th>Value</th><th>Unit</th><th>Normal</th><th>Date</th></tr></thead>
                    <tbody>
                        {observations.length === 0 ? (
                            <tr><td colSpan={5}><div className="empty-state"><span>🔬</span><p>No observations</p></div></td></tr>
                        ) : observations.map(o => (
                            <tr key={o.id}>
                                <td style={{ fontWeight: 500 }}>{o.test_name}</td>
                                <td>{o.value}</td>
                                <td className="text-muted">{o.unit}</td>
                                <td>
                                    <span className={`badge ${o.is_normal ? 'badge-success' : 'badge-danger'}`}>
                                        {o.is_normal ? '✓ Yes' : '✗ No'}
                                    </span>
                                </td>
                                <td className="text-muted">{o.test_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
