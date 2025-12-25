import { useLocation } from 'react-router-dom'
import { getAuthUser } from '../../utils/auth'
import Layout from '../../components/Layout'
import '../Dashboard.css'

const CoachProfile = () => {
  const location = useLocation()
  const user = getAuthUser()

  const sidebarItems = [
    { label: 'Dashboard', path: '/coach', active: location.pathname === '/coach', icon: null },
    { label: 'My Courses', path: '/coach/courses', active: location.pathname === '/coach/courses', icon: null },
    { label: 'Course Content', path: '/coach/content', active: false, icon: null },
    { label: 'Classes', path: '/coach/classes', active: location.pathname === '/coach/classes', icon: null },
    { label: 'Start Live Class', path: '/coach/live-class', active: location.pathname === '/coach/live-class', icon: '👥' },
    { label: 'Assignments', path: '/coach/assignments', active: location.pathname === '/coach/assignments', icon: null },
    { label: 'Profile', path: '/coach/profile', active: location.pathname === '/coach/profile', icon: null },
  ]

  return (
    <Layout sidebarItems={sidebarItems} title="Coach Dashboard" userRole="coach">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome Back!</h2>
        </div>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">MY COURSES</div>
            <div className="metric-value">1</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">MY CLASSES</div>
            <div className="metric-value">0</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">UPCOMING CLASSES</div>
            <div className="metric-value">22</div>
          </div>
        </div>

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

export default CoachProfile

