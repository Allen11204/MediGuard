export default function MedicationsList({ medications, onAdd, showAddButton }) {
    if (!medications) medications = []

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">💊 Medications</span>
                {showAddButton && <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add</button>}
            </div>
            <div className="card-body table-wrapper">
                <table>
                    <thead><tr><th>Medicine</th><th>Dosage</th><th>Purpose</th><th>Since</th></tr></thead>
                    <tbody>
                        {medications.length === 0 ? (
                            <tr><td colSpan={4}><div className="empty-state"><span>💊</span><p>No medications</p></div></td></tr>
                        ) : medications.map(m => (
                            <tr key={m.id}>
                                <td style={{ fontWeight: 500 }}>{m.medicine_name}</td>
                                <td>{m.dosage}</td>
                                <td className="text-muted">{m.purpose}</td>
                                <td className="text-muted">{m.start_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
