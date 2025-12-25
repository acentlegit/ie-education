import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getCourses, updateCourse } from '../../utils/courseApi'
import { getPages, createPage } from '../../utils/api'
import { uploadPDF, getModulePDFs, deletePDF, downloadPDF, viewPDF, formatFileSize } from '../../utils/pdfApi'
import './CourseDetails.css'

const CourseDetails = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [course, setCourse] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModuleModal, setShowAddModuleModal] = useState(false)
  const [modulePDFs, setModulePDFs] = useState({}) // { moduleId: [pdfs] }
  const [showPDFUploadModal, setShowPDFUploadModal] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [uploadingPDF, setUploadingPDF] = useState(false)
  const [showCreatePageModal, setShowCreatePageModal] = useState(false)
  const [newPageFormData, setNewPageFormData] = useState({
    title: '',
    content: ''
  })
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    pageId: ''
  })

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin', active: false, icon: null },
    { label: 'Users', path: '/admin/users', active: false, icon: null },
    { label: 'Courses', path: '/admin/courses', active: location.pathname.includes('/courses'), icon: null },
    { label: 'Pages', path: '/admin/pages', active: false, icon: null },
    { label: 'Reports', path: '/admin/reports', active: false, icon: null },
  ]

  const loadCourse = async () => {
    setLoading(true)
    try {
      const courses = await getCourses()
      const foundCourse = courses.find(c => {
        // Handle both string and number IDs
        const courseIdNum = parseInt(courseId)
        return c.id === courseIdNum || c.id === courseId || String(c.id) === String(courseId)
      })
      if (foundCourse) {
        // Create a deep copy to avoid mutation issues
        const courseCopy = JSON.parse(JSON.stringify(foundCourse))
        // Initialize curriculum if not exists (but don't overwrite if it exists)
        if (!courseCopy.curriculum || !Array.isArray(courseCopy.curriculum)) {
          courseCopy.curriculum = []
          // If we initialized it, save it back
          await updateCourse(courseCopy.id, { curriculum: [] })
        }
        setCourse(courseCopy)
        // Load pages after course is loaded
        const allPages = await getPages()
        setPages(allPages)
        // Load PDFs for all modules
        await loadModulePDFs(courseCopy.curriculum)
      } else {
        console.error('Course not found with ID:', courseId)
      }
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadModulePDFs = async (curriculum) => {
    if (!curriculum || curriculum.length === 0) return
    const pdfsMap = {}
    for (const module of curriculum) {
      const pdfs = await getModulePDFs(module.id)
      pdfsMap[module.id] = pdfs
    }
    setModulePDFs(pdfsMap)
  }

  const handleCreatePageFromModule = async (e) => {
    e.preventDefault()
    if (!newPageFormData.title.trim() || !newPageFormData.content.trim()) {
      alert('Please fill in both title and content')
      return
    }
    
    try {
      setLoading(true)
      // Create the new page
      const newPage = await createPage({
        title: newPageFormData.title,
        content: newPageFormData.content,
        course: courseId,
        pageType: 'Lesson',
        status: 'Draft'
      })
      
      // Reload pages list
      const allPages = await getPages()
      setPages(allPages)
      
      // Set the newly created page as the selected page in the module form
      setModuleFormData(prev => ({
        ...prev,
        pageId: newPage.id.toString()
      }))
      
      // Close create page modal
      setShowCreatePageModal(false)
      setNewPageFormData({ title: '', content: '' })
      
      alert(`Page created successfully!\n\nPage ID: #${newPage.id}\nTitle: ${newPage.title}\n\nThe page is now selected in "Link to Page" dropdown.\nYou can find it in Admin → Pages → All Pages.`)
    } catch (error) {
      console.error('Error creating page:', error)
      alert('Error creating page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const handleAddModule = async (e) => {
    e.preventDefault()
    if (!course) return

    // Generate sequential module ID based on existing modules
    const existingModuleIds = (course.curriculum || []).map(m => parseInt(m.id) || 0)
    const maxModuleId = existingModuleIds.length > 0 ? Math.max(...existingModuleIds) : 0

    const newModule = {
      id: maxModuleId + 1,
      title: moduleFormData.title,
      description: moduleFormData.description,
      pageId: moduleFormData.pageId || null,
      lessons: [],
      completedLessons: 0,
      totalLessons: 0
    }

    const updatedCurriculum = [...(course.curriculum || []), newModule]
    const updatedCourse = {
      ...course,
      curriculum: updatedCurriculum
    }

    try {
      // Ensure we're passing the curriculum explicitly as an array
      const courseUpdateData = {
        curriculum: updatedCurriculum // Explicitly pass curriculum as the main field
      }
      const savedCourse = await updateCourse(course.id, courseUpdateData)
      // Use the saved course from the API to ensure we have the latest data
      if (savedCourse && savedCourse.curriculum) {
        setCourse(savedCourse)
        // Reload to ensure everything is in sync
        await loadCourse()
        alert(`Module "${newModule.title}" added successfully!`)
      } else {
        // If save failed, still update local state and try to reload
        setCourse(updatedCourse)
        await loadCourse()
        alert('Module added. Please verify it appears correctly.')
      }
      setModuleFormData({ title: '', description: '', pageId: '' })
      setShowAddModuleModal(false)
    } catch (error) {
      console.error('Error adding module:', error)
      alert('Error adding module. Please try again.')
    }
  }

  const handleAddLesson = (moduleId) => {
    if (!course) return

    const lessonTitle = prompt('Enter lesson title:')
    if (!lessonTitle) return

    const updatedCurriculum = course.curriculum.map(module => {
      if (module.id === moduleId) {
        const newLesson = {
          id: Date.now(),
          title: lessonTitle,
          completed: false
        }
        return {
          ...module,
          lessons: [...(module.lessons || []), newLesson],
          totalLessons: (module.totalLessons || 0) + 1
        }
      }
      return module
    })

    const updatedCourse = {
      ...course,
      curriculum: updatedCurriculum
    }

    updateCourse(course.id, updatedCourse).then((savedCourse) => {
      if (savedCourse) {
        setCourse(savedCourse)
      } else {
        setCourse(updatedCourse)
      }
      // Reload course to ensure we have the latest data
      loadCourse()
    }).catch(error => {
      console.error('Error adding lesson:', error)
      alert('Error adding lesson. Please try again.')
    })
  }

  const handleToggleLesson = (moduleId, lessonId) => {
    if (!course) return

    const updatedCurriculum = course.curriculum.map(module => {
      if (module.id === moduleId) {
        const updatedLessons = module.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            const newCompleted = !lesson.completed
            return { ...lesson, completed: newCompleted }
          }
          return lesson
        })
        const completedCount = updatedLessons.filter(l => l.completed).length
        return {
          ...module,
          lessons: updatedLessons,
          completedLessons: completedCount
        }
      }
      return module
    })

    const updatedCourse = {
      ...course,
      curriculum: updatedCurriculum
    }

    updateCourse(course.id, updatedCourse).then((savedCourse) => {
      if (savedCourse) {
        setCourse(savedCourse)
      } else {
        setCourse(updatedCourse)
      }
      // Reload course to ensure we have the latest data
      loadCourse()
    }).catch(error => {
      console.error('Error toggling lesson:', error)
      alert('Error updating lesson. Please try again.')
    })
  }

  const handleDeleteModule = (moduleId) => {
    if (!course) return
    if (!window.confirm('Are you sure you want to delete this module?')) return

    const updatedCurriculum = course.curriculum.filter(m => m.id !== moduleId)
    const updatedCourse = {
      ...course,
      curriculum: updatedCurriculum
    }

    updateCourse(course.id, updatedCourse).then((savedCourse) => {
      if (savedCourse) {
        setCourse(savedCourse)
      } else {
        setCourse(updatedCourse)
      }
      // Remove PDFs from state
      const newPDFs = { ...modulePDFs }
      delete newPDFs[moduleId]
      setModulePDFs(newPDFs)
      // Reload course to ensure we have the latest data
      loadCourse()
    }).catch(error => {
      console.error('Error deleting module:', error)
      alert('Error deleting module. Please try again.')
    })
  }

  const handleAttachPDF = (moduleId) => {
    setSelectedModuleId(moduleId)
    setShowPDFUploadModal(true)
  }

  const handlePDFUpload = async (e) => {
    e.preventDefault()
    if (!selectedModuleId || !course) return

    const fileInput = document.getElementById('pdf-file-input')
    const file = fileInput?.files[0]
    if (!file) {
      alert('Please select a PDF file')
      return
    }

    setUploadingPDF(true)
    try {
      const pdfData = await uploadPDF(file, selectedModuleId, course.id)
      // Update module PDFs
      const currentPDFs = modulePDFs[selectedModuleId] || []
      setModulePDFs({
        ...modulePDFs,
        [selectedModuleId]: [...currentPDFs, pdfData]
      })
      // Reset form
      fileInput.value = ''
      setShowPDFUploadModal(false)
      setSelectedModuleId(null)
    } catch (error) {
      alert(error.message || 'Error uploading PDF')
    } finally {
      setUploadingPDF(false)
    }
  }

  const handleDeletePDF = async (pdfId, moduleId) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) return

    try {
      await deletePDF(pdfId)
      const currentPDFs = modulePDFs[moduleId] || []
      setModulePDFs({
        ...modulePDFs,
        [moduleId]: currentPDFs.filter(pdf => pdf.id !== pdfId)
      })
    } catch (error) {
      alert('Error deleting PDF')
    }
  }

  const handleDownloadPDF = (pdf) => {
    try {
      downloadPDF(pdf)
    } catch (error) {
      alert('Error downloading PDF')
    }
  }

  const handleViewPDF = (pdf) => {
    try {
      viewPDF(pdf)
    } catch (error) {
      alert('Error viewing PDF')
    }
  }

  const calculateCompletionRate = () => {
    if (!course?.curriculum || course.curriculum.length === 0) return 0
    const totalLessons = course.curriculum.reduce((sum, m) => sum + (m.totalLessons || 0), 0)
    const completedLessons = course.curriculum.reduce((sum, m) => sum + (m.completedLessons || 0), 0)
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  }

  if (loading) {
    return (
      <Layout sidebarItems={sidebarItems} title="Admin Dashboard" userRole="admin">
        <div>Loading course details...</div>
      </Layout>
    )
  }

  if (!course) {
    return (
      <Layout sidebarItems={sidebarItems} title="Admin Dashboard" userRole="admin">
        <div>Course not found</div>
      </Layout>
    )
  }

  const completionRate = calculateCompletionRate()
  const totalEnrollments = course.students?.length || 0
  const averageRating = course.averageRating || 4.8
  const totalRevenue = totalEnrollments * parseFloat(course.price?.replace('$', '') || 0)

  return (
    <Layout sidebarItems={sidebarItems} title="Admin Dashboard" userRole="admin">
      <div className="course-details-container">
        {/* Course Header */}
        <div className="course-header-gradient">
          <button className="close-button" onClick={() => navigate('/admin/courses')}>
            ✕
          </button>
          <h1 className="course-title">{course.title}</h1>
          <p className="course-description-header">{course.description}</p>
          <div className="course-badges">
            <span className="badge">
              <span className="badge-icon">👤</span>
              {course.level}
            </span>
            <span className="badge">
              <span className="badge-icon">📅</span>
              {course.duration}
            </span>
            <span className="badge">
              <span className="badge-icon">💰</span>
              {course.price}
            </span>
            <span className="badge">
              <span className="badge-icon">🏷️</span>
              {course.category}
            </span>
          </div>
        </div>

        {/* Course Analytics */}
        <div className="section">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Course Analytics
          </h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-value green">{totalEnrollments}</div>
              <div className="analytics-label">Total Enrollments</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value blue">{completionRate}%</div>
              <div className="analytics-label">Completion Rate</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value orange">{averageRating}/5</div>
              <div className="analytics-label">Average Rating</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value purple">${totalRevenue.toLocaleString()}</div>
              <div className="analytics-label">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Course Instructor */}
        <div className="section">
          <h2 className="section-title">
            <span className="section-icon">👤</span>
            Course Instructor
          </h2>
          <div className="instructor-card">
            <div className="instructor-avatar">
              {course.coach?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
            </div>
            <div className="instructor-info">
              <h3 className="instructor-name">{course.coach?.name || 'N/A'}</h3>
              <p className="instructor-specialization">{course.coach?.specialization || 'N/A'}</p>
              <div className="instructor-details">
                <span className="instructor-detail-item">
                  <span className="detail-icon">📧</span>
                  {course.coach?.email || 'sarah.johnson@coaching.com'}
                </span>
                <span className="instructor-detail-item">
                  <span className="detail-icon">🎓</span>
                  8 years experience
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Curriculum */}
        <div className="section">
          <div className="curriculum-header">
            <h2 className="section-title">
              <span className="section-icon">📚</span>
              Course Curriculum
            </h2>
            <button className="add-module-btn" onClick={() => setShowAddModuleModal(true)}>
              + Add Module
            </button>
          </div>

          {course.curriculum && course.curriculum.length > 0 ? (
            <div className="curriculum-list">
              {course.curriculum.map((module) => {
                const moduleCompletion = module.totalLessons > 0 
                  ? Math.round((module.completedLessons / module.totalLessons) * 100) 
                  : 0
                const isCompleted = module.totalLessons > 0 && module.completedLessons === module.totalLessons

                return (
                  <div key={module.id} className="curriculum-module">
                    <div className="module-header">
                      <div className="module-info">
                        <h3 className="module-title">{module.title}</h3>
                        {module.description && (
                          <p className="module-description">{module.description}</p>
                        )}
                        <div className="module-stats">
                          {module.totalLessons} lessons • {module.completedLessons}/{module.totalLessons} completed
                          {modulePDFs[module.id]?.length > 0 && (
                            <span className="pdf-count"> • 📄 {modulePDFs[module.id].length} PDF{modulePDFs[module.id].length !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                      <div className="module-actions">
                        {isCompleted && <span className="completed-badge">Completed</span>}
                        <button 
                          className="attach-pdf-btn"
                          onClick={() => handleAttachPDF(module.id)}
                        >
                          📄 Attach PDF
                        </button>
                        <button 
                          className="add-lesson-btn"
                          onClick={() => handleAddLesson(module.id)}
                        >
                          + Add Lesson
                        </button>
                        <button 
                          className="delete-module-btn"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {module.totalLessons > 0 && (
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar"
                          style={{ width: `${moduleCompletion}%` }}
                        />
                      </div>
                    )}
                    {/* PDFs Section */}
                    {modulePDFs[module.id] && modulePDFs[module.id].length > 0 && (
                      <div className="module-pdfs-section">
                        <h4 className="pdfs-section-title">📄 Attached PDFs</h4>
                        <div className="pdfs-list">
                          {modulePDFs[module.id].map((pdf) => (
                            <div key={pdf.id} className="pdf-item">
                              <span className="pdf-icon">📄</span>
                              <div className="pdf-info">
                                <span className="pdf-name">{pdf.name}</span>
                                <span className="pdf-size">{formatFileSize(pdf.size)}</span>
                              </div>
                              <div className="pdf-actions">
                                <button 
                                  className="pdf-view-btn"
                                  onClick={() => handleViewPDF(pdf)}
                                  title="View PDF"
                                >
                                  👁️ View
                                </button>
                                <button 
                                  className="pdf-download-btn"
                                  onClick={() => handleDownloadPDF(pdf)}
                                  title="Download PDF"
                                >
                                  ⬇️ Download
                                </button>
                                <button 
                                  className="pdf-delete-btn"
                                  onClick={() => handleDeletePDF(pdf.id, module.id)}
                                  title="Delete PDF"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {module.lessons && module.lessons.length > 0 && (
                      <div className="lessons-list">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="lesson-item">
                            <input
                              type="checkbox"
                              checked={lesson.completed || false}
                              onChange={() => handleToggleLesson(module.id, lesson.id)}
                              className="lesson-checkbox"
                            />
                            <span className={`lesson-title ${lesson.completed ? 'completed' : ''}`}>
                              {lesson.title}
                            </span>
                            {module.pageId && (
                              <button 
                                className="view-page-btn"
                                onClick={() => navigate(`/page/${module.pageId}`)}
                              >
                                View Page
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">No curriculum modules yet. Click "Add Module" to get started.</p>
          )}
        </div>

        {/* Add Module Modal */}
        {showAddModuleModal && (
          <div className="modal-overlay" onClick={() => setShowAddModuleModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Curriculum Module</h2>
                <button className="modal-close" onClick={() => setShowAddModuleModal(false)}>✕</button>
              </div>
              <form onSubmit={handleAddModule} className="module-form">
                <div className="form-group">
                  <label>Module Title</label>
                  <input
                    type="text"
                    value={moduleFormData.title}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                    placeholder="e.g., HTML & CSS Fundamentals"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                    rows="3"
                    placeholder="Module description..."
                  />
                </div>
                <div className="form-group">
                  <label>Link to Page (Optional)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <select
                      value={moduleFormData.pageId}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, pageId: e.target.value })}
                      style={{ flex: 1 }}
                    >
                      <option value="">No page linked</option>
                      {pages.map(page => (
                        <option key={page.id} value={page.id}>
                          {page.title} (ID: #{page.id})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCreatePageModal(true)}
                      style={{
                        padding: '10px 16px',
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + Create New Page
                    </button>
                  </div>
                  <small className="form-hint">
                    Link this module to a page from Page Management, or create a new page
                  </small>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModuleModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Add Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create New Page Modal */}
        {showCreatePageModal && (
          <div className="modal-overlay" onClick={() => setShowCreatePageModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Page</h2>
                <button className="modal-close" onClick={() => setShowCreatePageModal(false)}>✕</button>
              </div>
              <form onSubmit={handleCreatePageFromModule} className="module-form">
                <div className="form-group">
                  <label>Page Title</label>
                  <input
                    type="text"
                    value={newPageFormData.title}
                    onChange={(e) => setNewPageFormData({ ...newPageFormData, title: e.target.value })}
                    placeholder="Enter page title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Page Content</label>
                  <textarea
                    value={newPageFormData.content}
                    onChange={(e) => setNewPageFormData({ ...newPageFormData, content: e.target.value })}
                    rows="6"
                    placeholder="Enter page content"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => {
                      setShowCreatePageModal(false)
                      setNewPageFormData({ title: '', content: '' })
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Page'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PDF Upload Modal */}
        {showPDFUploadModal && (
          <div className="modal-overlay" onClick={() => setShowPDFUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Attach PDF to Module</h2>
                <button className="modal-close" onClick={() => setShowPDFUploadModal(false)}>✕</button>
              </div>
              <form onSubmit={handlePDFUpload} className="pdf-upload-form">
                <div className="form-group">
                  <label>Select PDF File</label>
                  <input
                    id="pdf-file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    required
                    className="pdf-file-input"
                  />
                  <small className="form-hint">
                    Maximum file size: 10MB. Only PDF files are allowed.
                  </small>
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => {
                      setShowPDFUploadModal(false)
                      setSelectedModuleId(null)
                      const fileInput = document.getElementById('pdf-file-input')
                      if (fileInput) fileInput.value = ''
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={uploadingPDF}>
                    {uploadingPDF ? 'Uploading...' : 'Upload PDF'}
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

export default CourseDetails

