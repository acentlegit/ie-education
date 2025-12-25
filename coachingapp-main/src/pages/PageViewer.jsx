import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { getPageById } from '../utils/api'
import { getAuthUser } from '../utils/auth'
import './PageViewer.css'

const PageViewer = () => {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const user = getAuthUser()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPage()
  }, [pageId])

  const loadPage = async () => {
    setLoading(true)
    try {
      const pageData = await getPageById(parseInt(pageId))
      if (pageData) {
        setPage(pageData)
      } else {
        alert('Page not found')
        navigate(-1)
      }
    } catch (error) {
      console.error('Error loading page:', error)
      alert('Error loading page')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const sidebarItems = [
    { label: 'Dashboard', path: user?.role === 'admin' ? '/admin' : user?.role === 'coach' ? '/coach' : '/student', active: false, icon: null },
    { label: 'Back', path: '#', active: false, icon: null },
  ]

  if (loading) {
    return (
      <Layout sidebarItems={sidebarItems} title="Loading..." userRole={user?.role || 'student'}>
        <div className="page-viewer-container">
          <div className="loading-state">Loading page...</div>
        </div>
      </Layout>
    )
  }

  if (!page) {
    return (
      <Layout sidebarItems={sidebarItems} title="Page Not Found" userRole={user?.role || 'student'}>
        <div className="page-viewer-container">
          <div className="error-state">Page not found</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout sidebarItems={sidebarItems} title={page.title} userRole={user?.role || 'student'}>
      <div className="page-viewer-container">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">{page.title}</h1>
          {page.status && (
            <span className={`page-status-badge status-${page.status.toLowerCase()}`}>
              {page.status}
            </span>
          )}
        </div>

        <div className="page-content-section">
          <div className="page-content">
            <div className="content-body">
              {page.content ? (
                <div className="content-text" dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }} />
              ) : (
                <p className="no-content">No content available for this page.</p>
              )}
            </div>
          </div>
        </div>

        {/* Page Users Section */}
        {page.users && page.users.length > 0 && (
          <div className="page-users-section">
            <h2 className="users-section-title">
              <span className="section-icon">👥</span>
              Page Access Users
            </h2>
            <div className="users-list-viewer">
              {page.users.map((user) => (
                <div key={user.id || user.name} className="user-card">
                  <div className="user-card-content">
                    <span className="user-name">{user.name}</span>
                    <span className={`user-role-badge role-${(user.role || 'viewer').toLowerCase()}`}>
                      {user.role || 'Viewer'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page Messages Section */}
        {page.messages && page.messages.length > 0 && (
          <div className="page-messages-section">
            <h2 className="messages-section-title">
              <span className="section-icon">💬</span>
              Page Messages & Announcements
            </h2>
            <div className="messages-list-viewer">
              {page.messages.map((message) => (
                <div key={message.id} className={`message-card message-${message.type || 'normal'}`}>
                  <div className="message-card-header">
                    <span className={`message-type-badge type-${message.type || 'normal'}`}>
                      {message.type === 'announcement' && '📢'}
                      {message.type === 'alert' && '⚠️'}
                      {message.type === 'info' && 'ℹ️'}
                      {message.type === 'warning' && '⚠️'}
                      {message.type === 'normal' && '💬'}
                      {message.type ? message.type.charAt(0).toUpperCase() + message.type.slice(1) : 'Normal'}
                    </span>
                    <span className="message-author-date">
                      {message.author} • {new Date(message.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="message-card-body">
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page Info Footer */}
        <div className="page-footer">
          <div className="page-meta">
            {page.createdAt && (
              <span className="meta-item">
                Created: {new Date(page.createdAt).toLocaleDateString()}
              </span>
            )}
            {page.updatedAt && (
              <span className="meta-item">
                Updated: {new Date(page.updatedAt).toLocaleDateString()}
              </span>
            )}
            {page.pageType && (
              <span className="meta-item">
                Type: {page.pageType}
              </span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PageViewer

