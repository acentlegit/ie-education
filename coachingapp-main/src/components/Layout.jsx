import { useNavigate } from 'react-router-dom'
import { logout, getAuthUser } from '../utils/auth'
import './Layout.css'

const Layout = ({ children, sidebarItems, title, userRole }) => {
  const navigate = useNavigate()
  const user = getAuthUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = (path) => {
    navigate(path)
  }

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          {userRole === 'admin' && (
            <>
              <span className="sidebar-icon">👤</span>
              <h2>Admin Panel</h2>
            </>
          )}
          {userRole === 'coach' && (
            <>
              <span className="sidebar-icon">👥</span>
              <h2>Coach Portal</h2>
            </>
          )}
          {userRole === 'student' && (
            <>
              <span className="sidebar-icon">🎓</span>
              <h2>Student Portal</h2>
            </>
          )}
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>{title}</h1>
          <div className="header-right">
            <span className="user-name">{user?.name}</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <div className="content-body">{children}</div>
      </main>
    </div>
  )
}

export default Layout














