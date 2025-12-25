import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import '../Dashboard.css'

const StudentLiveClass = () => {
  const location = useLocation()
  const [roomName, setRoomName] = useState('')

  const sidebarItems = [
    { label: 'Dashboard', path: '/student', active: location.pathname === '/student', icon: null },
    { label: 'My Courses', path: '/student/courses', active: location.pathname === '/student/courses', icon: null },
    { label: 'Classes', path: '/student/classes', active: location.pathname === '/student/classes', icon: null },
    { label: 'Join Live Class', path: '/student/live-class', active: location.pathname === '/student/live-class', icon: '👥' },
    { label: 'Assignments', path: '/student/assignments', active: location.pathname === '/student/assignments', icon: null },
    { label: 'Profile', path: '/student/profile', active: location.pathname === '/student/profile', icon: null },
  ]

  const handleJoinClass = () => {
    if (roomName) {
      // Handle join live class logic
      alert(`Joining class: ${roomName}`)
    }
  }

  return (
    <Layout sidebarItems={sidebarItems} title="Student Dashboard" userRole="student">
      <div className="dashboard-content">
        <div className="section">
          <h2 className="section-title">
            <span className="section-icon">👥</span>
            Join Live Class
          </h2>
          <div className="live-class-section">
            <div className="form-group">
              <label>Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="form-input"
              />
            </div>
            <button onClick={handleJoinClass} className="join-button">
              Join Class
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default StudentLiveClass

