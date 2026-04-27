import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = {
    Doctor: [
        { label: 'My Patients', icon: '👥', path: '/doctor/patients' },
    ],
    Patient: [
        { label: 'My Dashboard', icon: '📋', path: '/patient/dashboard' },
    ],
    Admin: [
        { label: 'User Management', icon: '👤', path: '/admin/users' },
        { label: 'Audit Logs',      icon: '📝', path: '/admin/audit-logs' },
    ],
}

const ROLE_BADGE = {
    Doctor:  'badge-info',
    Patient: 'badge-success',
    Admin:   'badge-purple',
}

function Layout({ children, title, breadcrumb, hasChat = false }) {
    const navigate  = useNavigate()
    const location  = useLocation()
    const role      = localStorage.getItem('role') || ''
    const username  = localStorage.getItem('username') || 'U'
    const items     = NAV_ITEMS[role] || []

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('username')
        navigate('/login')
    }

    return (
        <div>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h1>Medi<span>Guard</span></h1>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-label">Navigation</div>
                    {items.map(item => (
                        <button
                            key={item.path}
                            className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <h2>{title}</h2>
                    {breadcrumb && <div className="header-breadcrumb">{breadcrumb}</div>}
                </div>
                <div className="header-right">
                    <span className={`badge ${ROLE_BADGE[role] || 'badge-gray'}`}>{role}</span>
                    <div className="user-avatar">{username[0].toUpperCase()}</div>
                </div>
            </header>

            {/* Main */}
            <main className={`main-content${hasChat ? ' has-chat' : ''}`}>
                {children}
            </main>
        </div>
    )
}

export default Layout
