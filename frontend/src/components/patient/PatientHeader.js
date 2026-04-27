export default function PatientHeader({ profile }) {
    if (!profile) return null
    const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
        <div className="patient-header mb-5">
            <div className="patient-avatar">{initials}</div>
            <div className="patient-info">
                <h2>{profile.name}</h2>
                <div className="patient-meta">
                    <span className="patient-meta-item">🪪 MRN: <strong>{profile.mrn}</strong></span>
                    <span className="patient-meta-item">⚧ {profile.gender}</span>
                    {profile.dob  && <span className="patient-meta-item">🎂 {profile.dob}</span>}
                    {profile.phone && <span className="patient-meta-item">📞 {profile.phone}</span>}
                    {profile.email && <span className="patient-meta-item">✉️ {profile.email}</span>}
                </div>
            </div>
        </div>
    )
}
