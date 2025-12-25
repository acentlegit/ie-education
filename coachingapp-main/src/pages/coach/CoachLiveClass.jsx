import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'

const CoachLiveClass = () => {
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
      <div className="coach-content">
        <h2>Start Live Class</h2>
        <p>Live class functionality coming soon...</p>
      </div>
    </Layout>
  )
}

export default CoachLiveClass














