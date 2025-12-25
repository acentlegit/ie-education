import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getCourses, createCourse, updateCourse, deleteCourse, initializeCourses, resetCourses } from '../../utils/courseApi'
import { createSchedule } from '../../utils/scheduleApi'
import './AdminCourses.css'

const AdminCourses = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [scheduleFormData, setScheduleFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '',
    description: ''
  })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '',
    price: '',
    category: '',
    learningObjectives: '',
    prerequisites: ''
  })

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin', active: location.pathname === '/admin', icon: null },
    { label: 'Users', path: '/admin/users', active: location.pathname === '/admin/users', icon: null },
    { label: 'Courses', path: '/admin/courses', active: location.pathname === '/admin/courses', icon: null },
    { label: 'Pages', path: '/admin/pages', active: location.pathname === '/admin/pages', icon: null },
    { label: 'Reports', path: '/admin/reports', active: location.pathname === '/admin/reports', icon: null },
  ]

  useEffect(() => {
    // Force reset to 5 courses - clear existing and initialize
    resetCourses()
    loadCourses()
  }, [])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const data = await getCourses()
      setCourses(data)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const courseData = {
        ...formData,
        learningObjectives: formData.learningObjectives.split('\n').filter(obj => obj.trim()),
        prerequisites: formData.prerequisites.split('\n').filter(pr => pr.trim()),
        coach: {
          name: 'Dr. Sarah Johnson',
          specialization: formData.category
        },
        students: [],
        schedules: [],
        contentPages: 0
      }
      await createCourse(courseData)
      setFormData({
        title: '',
        description: '',
        level: 'Beginner',
        duration: '',
        price: '',
        category: '',
        learningObjectives: '',
        prerequisites: ''
      })
      setShowCreateModal(false)
      await loadCourses()
    } catch (error) {
      console.error('Error creating course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      level: course.level,
      duration: course.duration,
      price: course.price,
      category: course.category,
      learningObjectives: course.learningObjectives?.join('\n') || '',
      prerequisites: course.prerequisites?.join('\n') || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const courseData = {
        ...formData,
        learningObjectives: formData.learningObjectives.split('\n').filter(obj => obj.trim()),
        prerequisites: formData.prerequisites.split('\n').filter(pr => pr.trim())
      }
      await updateCourse(selectedCourse.id, courseData)
      setShowEditModal(false)
      setSelectedCourse(null)
      await loadCourses()
    } catch (error) {
      console.error('Error updating course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setLoading(true)
      try {
        await deleteCourse(courseId)
        await loadCourses()
      } catch (error) {
        console.error('Error deleting course:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleViewDetails = (course) => {
    navigate(`/admin/courses/${course.id}`)
  }

  const handleAddSchedule = (course) => {
    setSelectedCourse(course)
    setScheduleFormData({
      title: '',
      date: '',
      time: '',
      duration: '',
      description: ''
    })
    setShowScheduleModal(true)
  }

  const handleCreateSchedule = async (e) => {
    e.preventDefault()
    if (!selectedCourse) return

    setLoading(true)
    try {
      const scheduleData = {
        title: scheduleFormData.title || `${selectedCourse.title} - Session`,
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        date: scheduleFormData.date,
        time: scheduleFormData.time,
        duration: scheduleFormData.duration,
        instructor: selectedCourse.coach?.name || 'Admin',
        description: scheduleFormData.description || '',
        roomName: `${selectedCourse.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      }

      await createSchedule(scheduleData)
      
      // Update course schedules count
      const updatedCourse = {
        ...selectedCourse,
        schedules: [...(selectedCourse.schedules || []), scheduleData]
      }
      await updateCourse(selectedCourse.id, updatedCourse)

      setScheduleFormData({
        title: '',
        date: '',
        time: '',
        duration: '',
        description: ''
      })
      setShowScheduleModal(false)
      setSelectedCourse(null)
      await loadCourses()
    } catch (error) {
      console.error('Error creating schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout sidebarItems={sidebarItems} title="Admin Dashboard" userRole="admin">
      <div className="admin-courses-content">
        <div className="courses-header">
          <h2>Course Management</h2>
          <button className="create-course-btn" onClick={() => setShowCreateModal(true)}>
            + Create New Course
          </button>
        </div>

        {loading && courses.length === 0 ? (
          <p>Loading courses...</p>
        ) : (
          <>
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <div className="course-title-section">
                    <h3>{course.title}</h3>
                    <span className="course-level">{course.level}</span>
                  </div>
                  <div className="course-actions">
                    <button className="btn-view" onClick={() => handleViewDetails(course)}>
                      View Details
                    </button>
                    <button className="btn-add-schedule" onClick={() => handleAddSchedule(course)}>
                      + Add Schedule
                    </button>
                    <button className="btn-edit" onClick={() => handleEditCourse(course)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteCourse(course.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <p className="course-description">{course.description}</p>

                <div className="course-metrics">
                  <div className="metric-item">
                    <span className="metric-icon">📅</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-icon">💰</span>
                    <span>{course.price}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-icon">🏷️</span>
                    <span>{course.category}</span>
                  </div>
                </div>

                <div className="course-details-grid">
                  <div className="detail-item">
                    <div className="detail-label">COACH</div>
                    <div className="detail-value coach-value">
                      {course.coach?.name || 'N/A'}
                      <span className="coach-specialization">{course.coach?.specialization || ''}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">STUDENTS</div>
                    <div className="detail-value students-value">{course.students?.length || 0}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">CONTENT</div>
                    <div className="detail-value content-value">{course.contentPages || 0} pages</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">SCHEDULES</div>
                    <div className="detail-value schedules-value">{course.schedules?.length || 0} classes</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Course</h2>
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
              </div>
              <form onSubmit={handleCreateCourse} className="course-form">
                <div className="form-group">
                  <label>Course Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Beginner to Advanced">Beginner to Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 12 weeks"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g., $2999"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Web Development"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Learning Objectives (one per line)</label>
                  <textarea
                    value={formData.learningObjectives}
                    onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                    rows="4"
                    placeholder="Master fundamental concepts&#10;Build real-world projects"
                  />
                </div>
                <div className="form-group">
                  <label>Prerequisites (one per line)</label>
                  <textarea
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                    rows="3"
                    placeholder="Basic computer skills&#10;Internet connection"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Course</h2>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              <form onSubmit={handleUpdateCourse} className="course-form">
                <div className="form-group">
                  <label>Course Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Beginner to Advanced">Beginner to Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Learning Objectives (one per line)</label>
                  <textarea
                    value={formData.learningObjectives}
                    onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Prerequisites (one per line)</label>
                  <textarea
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    Update Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Schedule Modal */}
        {showScheduleModal && selectedCourse && (
          <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Schedule for {selectedCourse.title}</h2>
                <button className="modal-close" onClick={() => setShowScheduleModal(false)}>✕</button>
              </div>
              <form onSubmit={handleCreateSchedule} className="course-form">
                <div className="form-group">
                  <label>Session Title</label>
                  <input
                    type="text"
                    value={scheduleFormData.title}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, title: e.target.value })}
                    placeholder={`e.g., ${selectedCourse.title} - Week 1 Session 1`}
                  />
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
                  <label>Description (Optional)</label>
                  <textarea
                    value={scheduleFormData.description}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, description: e.target.value })}
                    rows="3"
                    placeholder="Session description..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowScheduleModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    Create Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminCourses

