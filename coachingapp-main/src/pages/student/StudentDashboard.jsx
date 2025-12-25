import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import '../Dashboard.css'

const StudentDashboard = () => {
  const location = useLocation()

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
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">ENROLLED COURSES</div>
            <div className="metric-value">1</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">UPCOMING CLASSES</div>
            <div className="metric-value">22</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">PENDING ASSIGNMENTS</div>
            <div className="metric-value">0</div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Upcoming Classes</h2>
          <div className="section-content">
            <p style={{ textAlign: 'center', color: '#6B7280' }}>No classes scheduled</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default StudentDashboard

