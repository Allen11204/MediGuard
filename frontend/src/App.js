import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import DoctorPatients from './pages/DoctorPatients'
import DoctorPatientDetail from './pages/DoctorPatientDetail'
import PatientDashboard from './pages/PatientDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminAuditLogs from './pages/AdminAuditLogs'
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Doctor routes */}
                <Route path="/doctor/patients" element={
                    <ProtectedRoute allowedRoles={['Doctor']}>
                        <DoctorPatients />
                    </ProtectedRoute>
                } />
                <Route path="/doctor/patients/:id" element={
                    <ProtectedRoute allowedRoles={['Doctor']}>
                        <DoctorPatientDetail />
                    </ProtectedRoute>
                } />

                {/* Patient routes */}
                <Route path="/patient/dashboard" element={
                    <ProtectedRoute allowedRoles={['Patient']}>
                        <PatientDashboard />
                    </ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin/users" element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminUsers />
                    </ProtectedRoute>
                } />
                <Route path="/admin/audit-logs" element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminAuditLogs />
                    </ProtectedRoute>
                } />

                {/* Error routing */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
