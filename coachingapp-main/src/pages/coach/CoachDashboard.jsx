import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import '../Dashboard.css'

const CoachDashboard = () => {
  const location = useLocation()

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
      </div>
    </Layout>
  )
}

export default CoachDashboard

