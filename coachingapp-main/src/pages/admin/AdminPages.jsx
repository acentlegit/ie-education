import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import VideoCall from '../../components/VideoCall'
import { getPages, createPage, searchPages, deletePage, updatePage, initializePages } from '../../utils/api'
import { getSchedules, createSchedule, deleteSchedule, initializeSchedules } from '../../utils/scheduleApi'
import { getCourses } from '../../utils/courseApi'
import { getAuthUser } from '../../utils/auth'
import { getActiveClasses, removeActiveClass } from '../../utils/activeClassesApi'
import { getRecordingsCount, initializeRecordings } from '../../utils/recordingsApi'
import './AdminPages.css'

const AdminPages = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getAuthUser()
  const [pages, setPages] = useState([])
  const [schedules, setSchedules] = useState([])
  const [courses, setCourses] = useState([])
  const [activeClasses, setActiveClasses] = useState([])
  const [recordingsCount, setRecordingsCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course: ''
  })
  const [scheduleFormData, setScheduleFormData] = useState({
    title: '',
    courseId: '',
    date: '',
    time: '',
    duration: '',
    description: ''
  })
  const [searchTitle, setSearchTitle] = useState('')
  const [searchId, setSearchId] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)
  const [activeTab, setActiveTab] = useState('Content')
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    course: '',
    pageType: 'Lesson',
    status: 'Draft',
    visibility: 'Public',
    priority: 'Medium',
    tags: ''
  })
  const [pageUsers, setPageUsers] = useState([])
  const [pageMessages, setPageMessages] = useState([])
  const [showAddMessageModal, setShowAddMessageModal] = useState(false)
  const [newMessage, setNewMessage] = useState({
    text: '',
    type: 'normal'
  })

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin', active: location.pathname === '/admin', icon: null },
    { label: 'Users', path: '/admin/users', active: location.pathname === '/admin/users', icon: null },
    { label: 'Courses', path: '/admin/courses', active: location.pathname === '/admin/courses', icon: null },
    { label: 'Pages', path: '/admin/pages', active: location.pathname === '/admin/pages', icon: null },
    { label: 'Reports', path: '/admin/reports', active: location.pathname === '/admin/reports', icon: null },
  ]

  const loadRecordingsCount = async () => {
    try {
      initializeRecordings()
      const count = await getRecordingsCount()
      setRecordingsCount(count)
    } catch (error) {
      console.error('Error loading recordings count:', error)
    }
  }

  useEffect(() => {
    initializePages()
    initializeSchedules()
    initializeRecordings()
    loadPages()
    loadSchedules()
    loadCourses()
    loadActiveClasses()
    loadRecordingsCount()
    
    // Set up polling to refresh active classes every 5 seconds
    const interval = setInterval(() => {
      loadActiveClasses()
      loadRecordingsCount()
    }, 5000)
    
    // Listen for messages from child windows (when classes start/end)
    const handleMessage = (event) => {
      if (event.data && (event.data.type === 'CLASS_STARTED' || event.data.type === 'CLASS_ENDED')) {
        loadActiveClasses()
      }
    }
    window.addEventListener('message', handleMessage)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const loadPages = async () => {
    setLoading(true)
    try {
      const data = await getPages()
      setPages(data)
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSchedules = async () => {
    try {
      const data = await getSchedules()
      setSchedules(data)
    } catch (error) {
      console.error('Error loading schedules:', error)
    }
  }

  const loadActiveClasses = async () => {
    try {
      const data = await getActiveClasses()
      setActiveClasses(data)
    } catch (error) {
      console.error('Error loading active classes:', error)
    }
  }

  const loadCourses = async () => {
    try {
      const data = await getCourses()
      setCourses(data)
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  const handleCreatePage = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const newPage = await createPage(formData)
      setFormData({ title: '', content: '', course: '' })
      await loadPages()
      // Show success message with page ID
      alert(`Page created successfully!\n\nPage ID: #${newPage.id}\nTitle: ${newPage.title}\n\nYou can search for this page using ID: ${newPage.id}`)
    } catch (error) {
      console.error('Error creating page:', error)
      alert('Error creating page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const results = await searchPages(searchTitle, searchId)
      setPages(results)
    } catch (error) {
      console.error('Error searching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShowAll = () => {
    setSearchTitle('')
    setSearchId('')
    loadPages()
  }

  const handleDeletePage = async (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      setLoading(true)
      try {
        await deletePage(pageId)
        await loadPages()
      } catch (error) {
        console.error('Error deleting page:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEditPage = (page) => {
    setSelectedPage(page)
    setEditFormData({
      title: page.title || '',
      content: page.content || '',
      course: page.course || '',
      pageType: page.pageType || 'Lesson',
      status: page.status || 'Draft',
      visibility: page.visibility || 'Public',
      priority: page.priority || 'Medium',
      tags: page.tags || ''
    })
    setPageUsers(page.users || [])
    setPageMessages(page.messages || [])
    setActiveTab('Content')
    setShowEditModal(true)
  }

  const handleUpdatePage = async (e) => {
    e.preventDefault()
    if (!selectedPage) return
    
    setLoading(true)
    try {
      const updatedPage = {
        ...selectedPage,
        title: editFormData.title,
        content: editFormData.content,
        course: editFormData.course,
        pageType: editFormData.pageType,
        status: editFormData.status,
        visibility: editFormData.visibility,
        priority: editFormData.priority,
        tags: editFormData.tags,
        users: pageUsers,
        messages: pageMessages,
        updatedAt: new Date().toISOString()
      }
      await updatePage(selectedPage.id, updatedPage)
      await loadPages()
      alert('Page updated successfully!')
      setShowEditModal(false)
      setSelectedPage(null)
    } catch (error) {
      console.error('Error updating page:', error)
      alert('Error updating page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    const userName = prompt('Enter username to add:')
    if (userName && userName.trim()) {
      const userRole = prompt('Enter user role (Viewer/Editor/Admin):') || 'Viewer'
      setPageUsers([...pageUsers, { 
        id: Date.now(), 
        name: userName.trim(), 
        role: userRole 
      }])
    }
  }

  const handleAddMessage = () => {
    setNewMessage({ text: '', type: 'normal' })
    setShowAddMessageModal(true)
  }

  const handleSubmitMessage = () => {
    if (newMessage.text && newMessage.text.trim()) {
      setPageMessages([...pageMessages, { 
        id: Date.now(), 
        text: newMessage.text.trim(), 
        type: newMessage.type,
        author: user?.name || 'Admin', 
        date: new Date().toISOString() 
      }])
      setNewMessage({ text: '', type: 'normal' })
      setShowAddMessageModal(false)
    }
  }

  const handleRemoveUser = (userId) => {
    setPageUsers(pageUsers.filter(u => u.id !== userId))
  }

  const handleRemoveMessage = (messageId) => {
    setPageMessages(pageMessages.filter(m => m.id !== messageId))
  }

  const handleDuplicatePage = async () => {
    if (!selectedPage) return
    
    try {
      setLoading(true)
      // Create a new page with copied data
      const duplicatedPage = {
        title: `${selectedPage.title} (Copy)`,
        content: selectedPage.content || '',
        course: selectedPage.course || '',
        pageType: selectedPage.pageType || 'Lesson',
        status: 'Draft', // Always set duplicated pages to Draft
        visibility: selectedPage.visibility || 'Public',
        priority: selectedPage.priority || 'Medium',
        tags: selectedPage.tags || '',
        users: selectedPage.users ? [...selectedPage.users] : [],
        messages: selectedPage.messages ? selectedPage.messages.map(msg => ({
          ...msg,
          id: Date.now() + Math.random(), // New IDs for messages
          date: new Date().toISOString()
        })) : []
      }
      
      const newPage = await createPage(duplicatedPage)
      await loadPages()
      alert(`Page duplicated successfully! New page ID: #${newPage.id}`)
      setShowEditModal(false)
      setSelectedPage(null)
    } catch (error) {
      console.error('Error duplicating page:', error)
      alert('Error duplicating page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartLiveClass = () => {
    navigate('/admin/live-class/start')
  }

  const handleScheduleClass = () => {
    setShowScheduleModal(true)
  }

  const handleCreateSchedule = async (e) => {
    e.preventDefault()
    try {
      const course = courses.find(c => c.id === parseInt(scheduleFormData.courseId))
      await createSchedule({
        ...scheduleFormData,
        courseTitle: course?.title || '',
        instructor: course?.coach?.name || 'Admin',
        roomName: scheduleFormData.title.toLowerCase().replace(/\s+/g, '-')
      })
      setScheduleFormData({
        title: '',
        courseId: '',
        date: '',
        time: '',
        duration: '',
        description: ''
      })
      setShowScheduleModal(false)
      await loadSchedules()
    } catch (error) {
      console.error('Error creating schedule:', error)
    }
  }

  const handleStartScheduledClass = (schedule) => {
    // Open in new tab so the admin can still see the active classes list
    window.open(`/admin/live-class/join?room=${encodeURIComponent(schedule.roomName)}&role=host`, '_blank')
  }

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(scheduleId)
        await loadSchedules()
      } catch (error) {
        console.error('Error deleting schedule:', error)
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    // Handle both ISO date strings and YYYY-MM-DD format
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00')
    if (isNaN(date.getTime())) {
      // If date parsing fails, try to format YYYY-MM-DD directly
      const parts = dateString.split('-')
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`
      }
      return dateString
    }
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const handleEndClass = async (classId, roomName) => {
    if (window.confirm('Are you sure you want to end this live class?')) {
      try {
        await removeActiveClass(classId)
        await loadActiveClasses()
        alert('Live class ended successfully!')
      } catch (error) {
        console.error('Error ending class:', error)
        alert('Error ending class. Please try again.')
      }
    }
  }

  const handleJoinActiveClass = (roomName) => {
    window.open(`/admin/live-class/join?room=${encodeURIComponent(roomName)}&role=viewer`, '_blank')
  }

  const activeClassesCount = activeClasses.length
  const scheduledToday = schedules.filter(s => {
    const today = new Date().toISOString().split('T')[0]
    return s.date === today && s.status === 'upcoming'
  }).length
  const totalParticipants = activeClasses.reduce((sum, ac) => sum + (ac.participants || 0), 0)

  return (
    <Layout sidebarItems={sidebarItems} title="Admin Dashboard" userRole="admin">
      {showVideoCall && currentRoom ? (
        <VideoCall
          roomName={currentRoom.name}
          userName={user?.name || 'Admin'}
          userRole={currentRoom.role}
          onClose={() => {
            setShowVideoCall(false)
            setCurrentRoom(null)
          }}
        />
      ) : (
        <div className="admin-pages-content">
          {/* Create New Page Section */}
          <div className="create-page-section">
            <h2>Create New Page</h2>
            <form onSubmit={handleCreatePage} className="page-form">
              <div className="form-group">
                <label>Page Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter page title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter page content"
                  rows="6"
                  required
                />
              </div>
              <div className="form-group">
                <label>Course (Optional)</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="">No course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="create-button" disabled={loading}>
                Create Page
              </button>
            </form>
          </div>

          {/* Search Pages Section */}
          <div className="search-pages-section">
            <h2>Search Pages</h2>
            <div className="search-form">
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search by title..."
              />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Search by Page ID..."
              />
              <div className="search-buttons">
                <button onClick={handleSearch} className="search-button" disabled={loading}>
                  Search
                </button>
                <button onClick={handleShowAll} className="show-all-button" disabled={loading}>
                  Show All
                </button>
              </div>
            </div>
          </div>

          {/* Live Video Classes & Schedules Section */}
          <div className="live-classes-section">
            <h2 className="section-title">
              <span className="section-icon">📹</span>
              Live Video Classes & Schedules
            </h2>
            <div className="live-classes-actions">
              <button className="action-btn start-live" onClick={handleStartLiveClass}>
                <span className="btn-icon">▶️</span>
                Start Live Class
              </button>
              <button className="action-btn schedule" onClick={handleScheduleClass}>
                <span className="btn-icon">📅</span>
                Schedule Class
              </button>
              <button className="action-btn view-recordings">
                <span className="btn-icon">📹</span>
                View Recordings
              </button>
              <button className="action-btn manage-rooms">
                <span className="btn-icon">🏠</span>
                Manage Rooms
              </button>
            </div>

            <div className="live-overview">
              <div className="overview-card">
                <span className="overview-icon">📊</span>
                <div className="overview-value">{activeClassesCount}</div>
                <div className="overview-label">ACTIVE NOW</div>
              </div>
              <div className="overview-card">
                <span className="overview-icon">📅</span>
                <div className="overview-value">{scheduledToday}</div>
                <div className="overview-label">SCHEDULED TODAY</div>
              </div>
              <div className="overview-card">
                <span className="overview-icon">👥</span>
                <div className="overview-value">{totalParticipants}</div>
                <div className="overview-label">PARTICIPANTS</div>
              </div>
              <div className="overview-card">
                <span className="overview-icon">📹</span>
                <div className="overview-value">{recordingsCount}</div>
                <div className="overview-label">RECORDINGS</div>
              </div>
            </div>
          </div>

          {/* Scheduled Classes Section */}
          <div className="scheduled-classes-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📅</span>
                Your Scheduled Classes
              </h2>
              <button className="refresh-btn" onClick={loadSchedules}>
                <span className="btn-icon">🔄</span>
                Refresh
              </button>
            </div>

            {schedules.length > 0 ? (
              <div className="schedules-list">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="schedule-card">
                    <div className="schedule-info">
                      <h3 className="schedule-title">{schedule.title}</h3>
                      <div className="schedule-details">
                        <span className="detail-item">
                          <span className="detail-icon">📅</span>
                          {formatDate(schedule.date)}
                        </span>
                        <span className="detail-item">
                          <span className="detail-icon">🕐</span>
                          {schedule.time}
                        </span>
                        <span className="detail-item">
                          <span className="detail-icon">⏱️</span>
                          {schedule.duration}
                        </span>
                        <span className="detail-item">
                          <span className="detail-icon">👤</span>
                          {schedule.instructor}
                        </span>
                      </div>
                      {schedule.description && (
                        <p className="schedule-description">{schedule.description}</p>
                      )}
                    </div>
                    <div className="schedule-actions">
                      <span className="status-badge upcoming">📅 UPCOMING</span>
                      <button
                        className="action-btn-small start"
                        onClick={() => handleStartScheduledClass(schedule)}
                      >
                        <span className="btn-icon">▶️</span>
                        Start Now
                      </button>
                      <button className="action-btn-small edit">
                        <span className="btn-icon">✏️</span>
                        Edit
                      </button>
                      <button
                        className="action-btn-small delete"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <span className="btn-icon">🗑️</span>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No scheduled classes</p>
            )}

            <div className="active-classes-section">
              <h3 className="section-subtitle">
                <span className="section-icon">🔴</span>
                Currently Active Classes
              </h3>
              {activeClasses.length === 0 ? (
                <>
                  <p className="empty-state">No active classes</p>
                  <p className="empty-state-hint">Start a live class to see it here.</p>
                </>
              ) : (
                <div className="active-classes-list">
                  {activeClasses.map((activeClass) => (
                    <div key={activeClass.id} className="active-class-card">
                      <div className="active-class-info">
                        <div className="active-class-header">
                          <h4 className="active-class-title">{activeClass.title}</h4>
                          <span className="active-indicator">🔴 LIVE</span>
                        </div>
                        <div className="active-class-details">
                          <span className="detail-item">
                            <span className="detail-icon">👤</span>
                            {activeClass.instructor}
                          </span>
                          <span className="detail-item">
                            <span className="detail-icon">🏠</span>
                            Room: {activeClass.roomName}
                          </span>
                          <span className="detail-item">
                            <span className="detail-icon">👥</span>
                            {activeClass.participants} participant{activeClass.participants !== 1 ? 's' : ''}
                          </span>
                          <span className="detail-item">
                            <span className="detail-icon">🕐</span>
                            Started: {formatTime(activeClass.startedAt)}
                          </span>
                        </div>
                        {activeClass.courseTitle && (
                          <p className="active-class-course">Course: {activeClass.courseTitle}</p>
                        )}
                      </div>
                      <div className="active-class-actions">
                        <button
                          className="action-btn-small join"
                          onClick={() => handleJoinActiveClass(activeClass.roomName)}
                        >
                          <span className="btn-icon">▶️</span>
                          Join
                        </button>
                        <button
                          className="action-btn-small end"
                          onClick={() => handleEndClass(activeClass.id, activeClass.roomName)}
                        >
                          <span className="btn-icon">⏹️</span>
                          End Class
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Page Operations Section */}
          <div className="page-operations-section">
            <h2>Page Operations</h2>
            <div className="operations-buttons">
              <button className="operation-btn templates">
                <span className="btn-icon">📄</span>
                Page Templates
              </button>
              <button className="operation-btn analytics">
                <span className="btn-icon">📊</span>
                Page Analytics
              </button>
              <button className="operation-btn export">
                <span className="btn-icon">⬇️</span>
                Export Pages
              </button>
              <button className="operation-btn bulk">
                <span className="btn-icon">📦</span>
                Bulk Operations
              </button>
            </div>
          </div>

          {/* All Pages Table Section */}
          <div className="pages-table-section">
            <h2>All Pages</h2>
            {loading ? (
              <p>Loading...</p>
            ) : pages.length === 0 ? (
              <p className="empty-state">No pages found.</p>
            ) : (
              <div className="pages-table-container">
                <table className="pages-table">
                  <thead>
                    <tr>
                      <th>PAGE ID</th>
                      <th>TITLE</th>
                      <th>STATUS</th>
                      <th>TYPE</th>
                      <th>COURSE</th>
                      <th>CREATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id}>
                        <td>
                          <a href={`#${page.id}`} className="page-id-link">
                            #{page.id}
                          </a>
                        </td>
                        <td>{page.title}</td>
                        <td>
                          <span className={`status-badge ${(page.status || 'Draft').toLowerCase()}`}>
                            {(page.status || 'DRAFT').toUpperCase()}
                          </span>
                        </td>
                        <td>{page.pageType || 'page'}</td>
                        <td>{page.course ? courses.find(c => c.id.toString() === page.course.toString())?.title || 'N/A' : 'No Course'}</td>
                        <td>{formatDate(page.createdAt)}</td>
                        <td>
                          <button 
                            className="table-btn view"
                            onClick={() => navigate(`/page/${page.id}`)}
                          >
                            View
                          </button>
                          <button 
                            className="table-btn edit"
                            onClick={() => handleEditPage(page)}
                          >
                            Edit
                          </button>
                          <button
                            className="table-btn delete"
                            onClick={() => handleDeletePage(page.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Edit Page Modal */}
          {showEditModal && selectedPage && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
              <div className="edit-page-modal" onClick={(e) => e.stopPropagation()}>
                <div className="edit-modal-header">
                  <div className="edit-header-content">
                    <div className="edit-header-title">
                      <span className="edit-header-icon">📄</span>
                      <div>
                        <h2>Edit Page #{selectedPage.id}</h2>
                        <p>Comprehensive page management and user access control</p>
                      </div>
                    </div>
                    <button className="edit-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
                  </div>
                </div>

                <div className="edit-modal-tabs">
                  <button 
                    className={`edit-tab ${activeTab === 'Content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Content')}
                  >
                    <span className="tab-icon">📄</span>
                    Content
                  </button>
                  <button 
                    className={`edit-tab ${activeTab === 'Users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Users')}
                  >
                    <span className="tab-icon">👥</span>
                    Users
                  </button>
                  <button 
                    className={`edit-tab ${activeTab === 'Messages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Messages')}
                  >
                    <span className="tab-icon">💬</span>
                    Messages
                  </button>
                  <button 
                    className={`edit-tab ${activeTab === 'Settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Settings')}
                  >
                    <span className="tab-icon">⚙️</span>
                    Settings
                  </button>
                </div>

                <form onSubmit={handleUpdatePage} className="edit-modal-content">
                  {/* Content Tab */}
                  {activeTab === 'Content' && (
                    <div className="edit-tab-content">
                      <div className="edit-form-left">
                        <div className="form-group">
                          <label>Page Title</label>
                          <input
                            type="text"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Content</label>
                          <textarea
                            value={editFormData.content}
                            onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                            rows="8"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Course Assignment</label>
                          <select
                            value={editFormData.course}
                            onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                          >
                            <option value="">No Course</option>
                            {courses.map(course => (
                              <option key={course.id} value={course.id}>
                                {course.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Page Type</label>
                          <select
                            value={editFormData.pageType}
                            onChange={(e) => setEditFormData({ ...editFormData, pageType: e.target.value })}
                          >
                            <option value="Lesson">Lesson</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Resource">Resource</option>
                            <option value="Page">Page</option>
                          </select>
                        </div>
                      </div>
                      <div className="edit-form-right">
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          >
                            <option value="Draft">📄 Draft</option>
                            <option value="Published">✅ Published</option>
                            <option value="Archived">📦 Archived</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Visibility</label>
                          <select
                            value={editFormData.visibility}
                            onChange={(e) => setEditFormData({ ...editFormData, visibility: e.target.value })}
                          >
                            <option value="Public">🌐 Public</option>
                            <option value="Private">🔒 Private</option>
                            <option value="Course Only">👥 Course Only</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Priority</label>
                          <select
                            value={editFormData.priority}
                            onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                          >
                            <option value="Low">🟢 Low</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="High">🔴 High</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Tags</label>
                          <input
                            type="text"
                            value={editFormData.tags}
                            onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                            placeholder="web, html, css, beginner"
                          />
                          <small className="form-hint">Separate tags with commas</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Users Tab */}
                  {activeTab === 'Users' && (
                    <div className="edit-tab-content users-tab-content">
                      <div className="tab-section-header">
                        <div className="header-left">
                          <h3>
                            <span className="section-icon">👥</span>
                            User Access Management
                          </h3>
                          <button type="button" className="add-user-btn" onClick={handleAddUser}>
                            + Add User
                          </button>
                        </div>
                      </div>
                      <div className="users-list">
                        {pageUsers.length === 0 ? (
                          <p className="empty-list">No users added yet. Click "+ Add User" to add users.</p>
                        ) : (
                          pageUsers.map(user => (
                            <div key={user.id} className="user-item">
                              <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-role">{user.role}</span>
                              </div>
                              <button 
                                type="button"
                                className="remove-btn"
                                onClick={() => handleRemoveUser(user.id)}
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Messages Tab */}
                  {activeTab === 'Messages' && (
                    <div className="edit-tab-content messages-tab-content">
                      <div className="tab-section-header">
                        <div className="header-left">
                          <h3>
                            <span className="section-icon">💬</span>
                            Page Messages & Comments
                          </h3>
                          <button type="button" className="add-message-btn" onClick={handleAddMessage}>
                            + Add Message
                          </button>
                        </div>
                      </div>
                      <div className="messages-list">
                        {pageMessages.length === 0 ? (
                          <p className="empty-list">No messages yet. Click "+ Add Message" to add a message.</p>
                        ) : (
                          pageMessages.map(message => (
                            <div key={message.id} className={`message-item message-${message.type || 'normal'}`}>
                              <div className="message-content">
                                <div className="message-header">
                                  <span className={`message-type-badge type-${message.type || 'normal'}`}>
                                    {message.type === 'announcement' && '📢'}
                                    {message.type === 'alert' && '⚠️'}
                                    {message.type === 'info' && 'ℹ️'}
                                    {message.type === 'warning' && '⚠️'}
                                    {message.type === 'normal' && '💬'}
                                    {message.type ? message.type.charAt(0).toUpperCase() + message.type.slice(1) : 'Normal'}
                                  </span>
                                  <span className="message-meta">{message.author} • {new Date(message.date).toLocaleDateString()}</span>
                                </div>
                                <p>{message.text}</p>
                              </div>
                              <button 
                                type="button"
                                className="remove-btn"
                                onClick={() => handleRemoveMessage(message.id)}
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'Settings' && (
                    <div className="edit-tab-content">
                      <div className="settings-grid">
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          >
                            <option value="Draft">📄 Draft</option>
                            <option value="Published">✅ Published</option>
                            <option value="Archived">📦 Archived</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Visibility</label>
                          <select
                            value={editFormData.visibility}
                            onChange={(e) => setEditFormData({ ...editFormData, visibility: e.target.value })}
                          >
                            <option value="Public">🌐 Public</option>
                            <option value="Private">🔒 Private</option>
                            <option value="Course Only">👥 Course Only</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Priority</label>
                          <select
                            value={editFormData.priority}
                            onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                          >
                            <option value="Low">🟢 Low</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="High">🔴 High</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Tags</label>
                          <input
                            type="text"
                            value={editFormData.tags}
                            onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                            placeholder="web, html, css, beginner"
                          />
                          <small className="form-hint">Separate tags with commas</small>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="edit-modal-actions">
                    <button type="submit" className="action-btn save-btn">
                      <span className="btn-icon">💾</span>
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="action-btn preview-btn"
                      onClick={() => {
                        // Save current changes first, then preview
                        if (selectedPage) {
                          const currentPageData = {
                            ...selectedPage,
                            title: editFormData.title,
                            content: editFormData.content,
                            course: editFormData.course,
                            pageType: editFormData.pageType,
                            status: editFormData.status,
                            visibility: editFormData.visibility,
                            priority: editFormData.priority,
                            tags: editFormData.tags,
                            users: pageUsers,
                            messages: pageMessages
                          }
                          updatePage(selectedPage.id, currentPageData).then(() => {
                            window.open(`/page/${selectedPage.id}`, '_blank')
                          })
                        } else {
                          window.open(`/page/${selectedPage.id}`, '_blank')
                        }
                      }}
                    >
                      <span className="btn-icon">👁️</span>
                      Preview
                    </button>
                    <button 
                      type="button" 
                      className="action-btn duplicate-btn"
                      onClick={handleDuplicatePage}
                    >
                      <span className="btn-icon">📋</span>
                      Duplicate
                    </button>
                    <button 
                      type="button" 
                      className="action-btn cancel-btn"
                      onClick={() => setShowEditModal(false)}
                    >
                      <span className="btn-icon">✕</span>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Message Modal */}
          {showAddMessageModal && (
            <div className="modal-overlay" onClick={() => setShowAddMessageModal(false)}>
              <div className="modal-content message-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add Message</h2>
                  <button className="modal-close" onClick={() => setShowAddMessageModal(false)}>✕</button>
                </div>
                <div className="message-form">
                  <div className="form-group">
                    <label>Message Type</label>
                    <select
                      value={newMessage.type}
                      onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                      className="message-type-select"
                    >
                      <option value="normal">💬 Normal</option>
                      <option value="announcement">📢 Announcement</option>
                      <option value="alert">⚠️ Alert</option>
                      <option value="info">ℹ️ Info</option>
                      <option value="warning">⚠️ Warning</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Message Text</label>
                    <textarea
                      value={newMessage.text}
                      onChange={(e) => setNewMessage({ ...newMessage, text: e.target.value })}
                      rows="5"
                      placeholder="Enter your message..."
                      className="message-textarea"
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-cancel" 
                      onClick={() => {
                        setShowAddMessageModal(false)
                        setNewMessage({ text: '', type: 'normal' })
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn-submit" 
                      onClick={handleSubmitMessage}
                      disabled={!newMessage.text.trim()}
                    >
                      Add Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Class Modal */}
          {showScheduleModal && (
            <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Schedule Class</h2>
                  <button className="modal-close" onClick={() => setShowScheduleModal(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateSchedule} className="schedule-form">
                  <div className="form-group">
                    <label>Class Title</label>
                    <input
                      type="text"
                      value={scheduleFormData.title}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, title: e.target.value })}
                      placeholder="e.g., Week 2 Session 1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Course</label>
                    <select
                      value={scheduleFormData.courseId}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, courseId: e.target.value })}
                      required
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={scheduleFormData.date}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={scheduleFormData.time}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={scheduleFormData.duration}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, duration: e.target.value })}
                      placeholder="e.g., 90 mins"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={scheduleFormData.description}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, description: e.target.value })}
                      rows="3"
                      placeholder="Class description..."
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowScheduleModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                      Create Schedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

export default AdminPages

