import { useLocation } from 'react-router-dom'
import { getAuthUser } from '../../utils/auth'
import Layout from '../../components/Layout'
import '../Dashboard.css'

const StudentProfile = () => {
  const location = useLocation()
  const user = getAuthUser()

  const sidebarItems = [
    { label: 'Dashboard', path: '/student', active: location.pathname === '/student', icon: null },
    { label: 'My Courses', path: '/student/courses', active: location.pathname === '/student/courses', icon: null },
    { label: 'Classes', path: '/student/classes', active: location.pathname === '/student/classes', icon: null },
    { label: 'Join Live Class', path: '/student/live-class', active: location.pathname === '/student/live-class', icon: '👥' },
    { label: 'Assignments', path: '/student/assignments', active: location.pathname === '/student/assignments', icon: null },
    { label: 'Profile', path: '/student/profile', active: location.pathname === '/student/profile', icon: null },
  ]

  return (
    <Layout sidebarItems={sidebarItems} title="Student Dashboard" userRole="student">
      <div className="dashboard-content">
        <div className="section">
          <h2 className="section-title">My Profile</h2>
          <div className="profile-card">
            <h3>Profile Information</h3>
            <div className="profile-info">
              <div className="info-item">
                <strong>Name:</strong> {user?.name || 'N/A'}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {user?.email || 'N/A'}
              </div>
              <div className="info-item">
                <strong>Username:</strong> {user?.username || 'N/A'}
              </div>
              <div className="info-item">
                <strong>Role:</strong> {user?.role || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default StudentProfile

