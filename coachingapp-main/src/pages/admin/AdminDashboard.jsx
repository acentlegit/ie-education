import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getUsers } from '../../utils/userApi'
import { getCourses } from '../../utils/courseApi'
import { getSchedules } from '../../utils/scheduleApi'
import { getPages } from '../../utils/api'
import '../Dashboard.css'

const AdminDashboard = () => {
  const location = useLocation()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalClasses: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin', active: location.pathname === '/admin', icon: null },
    { label: 'Users', path: '/admin/users', active: location.pathname === '/admin/users', icon: null },
    { label: 'Courses', path: '/admin/courses', active: location.pathname === '/admin/courses', icon: null },
    { label: 'Pages', path: '/admin/pages', active: location.pathname === '/admin/pages', icon: null },
    { label: 'Reports', path: '/admin/reports', active: location.pathname === '/admin/reports', icon: null },
  ]

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    setLoading(true)
    try {
      const [users, courses, schedules, pages] = await Promise.all([
        getUsers(),
        getCourses(),
        getSchedules(),
        getPages()
      ])

      setStats({
        totalUsers: users.length,
        totalCourses: courses.length,
        totalClasses: schedules.length,
        totalPages: pages.length
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout sidebarItems={sidebarItems} title="Admin Dashboard" userRole="admin">
      <div className="dashboard-content">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">TOTAL USERS</div>
            <div className="metric-value">{loading ? '...' : stats.totalUsers}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">TOTAL COURSES</div>
            <div className="metric-value">{loading ? '...' : stats.totalCourses}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">TOTAL CLASSES</div>
            <div className="metric-value">{loading ? '...' : stats.totalClasses}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">TOTAL PAGES</div>
            <div className="metric-value">{loading ? '...' : stats.totalPages}</div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">System Overview</h2>
          <div className="section-content">
            <div className="overview-grid">
              <div className="overview-item">
                <h3>Recent Activity</h3>
                <p>System is running smoothly</p>
              </div>
              <div className="overview-item">
                <h3>System Status</h3>
                <p className="status-online">🟢 All systems operational</p>
              </div>
              <div className="overview-item">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button className="quick-action-btn">Create Course</button>
                  <button className="quick-action-btn">Add User</button>
                  <button className="quick-action-btn">Create Page</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
