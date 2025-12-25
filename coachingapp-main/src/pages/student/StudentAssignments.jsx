import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'

const StudentAssignments = () => {
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
      <div className="student-content">
        <h2>Assignments</h2>
        <p>Assignment submission functionality coming soon...</p>
      </div>
    </Layout>
  )
}

export default StudentAssignments














