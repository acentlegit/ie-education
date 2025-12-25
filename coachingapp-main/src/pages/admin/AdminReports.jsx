import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'

const AdminReports = () => {
  const location = useLocation()

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin', active: location.pathname === '/admin', icon: null },
    { label: 'Users', path: '/admin/users', active: location.pathname === '/admin/users', icon: null },
    { label: 'Courses', path: '/admin/courses', active: location.pathname === '/admin/courses', icon: null },
    { label: 'Pages', path: '/admin/pages', active: location.pathname === '/admin/pages', icon: null },
    { label: 'Reports', path: '/admin/reports', active: location.pathname === '/admin/reports', icon: null },
  ]

  return (
    <Layout sidebarItems={sidebarItems} title="Admin Dashboard" userRole="admin">
      <div className="admin-content">
        <h2>Reports</h2>
        <p>Reports functionality coming soon...</p>
      </div>
    </Layout>
  )
}

export default AdminReports














