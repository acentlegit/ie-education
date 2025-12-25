import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthUser } from '../../utils/auth'
import './StartLiveClass.css'

const StartLiveClass = () => {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [roomName, setRoomName] = useState('')

  const handleStartClass = (e) => {
    e.preventDefault()
    if (!roomName.trim()) {
      alert('Please enter a room name')
      return
    }
    // Open in new tab so the admin can still see the active classes list
    window.open(`/admin/live-class/join?room=${encodeURIComponent(roomName)}&role=host`, '_blank')
    // Navigate back to pages after a short delay
    setTimeout(() => {
      navigate('/admin/pages')
    }, 500)
  }

  return (
    <div className="start-live-class-container">
      <div className="start-live-class-card">
        <div className="page-header">
          <div className="header-left">
            <span className="camera-icon">📹</span>
            <h1>Live Class</h1>
          </div>
          <div className="header-right">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <button className="back-button" onClick={() => navigate('/admin/pages')}>
              Back
            </button>
          </div>
        </div>

        <div className="start-live-content">
          <div className="content-header">
            <span className="section-icon">📹</span>
            <h2>Start Live Class</h2>
          </div>

          <form onSubmit={handleStartClass} className="start-class-form">
            <div className="form-group">
              <label htmlFor="roomName">Room Name</label>
              <input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Create a room name (e.g., math-101)"
                required
              />
            </div>

            <button type="submit" className="start-class-button">
              Start Live Class
            </button>
          </form>

          <div className="hint-section">
            <span className="hint-icon">💡</span>
            <p className="hint-text">Share the room name with participants so they can join your class</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartLiveClass

