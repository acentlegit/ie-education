import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAuthUser } from '../../utils/auth'
import VideoCall from '../../components/VideoCall'
import { addActiveClass, removeActiveClassByRoom } from '../../utils/activeClassesApi'
import './JoinLiveClass.css'

const JoinLiveClass = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = getAuthUser()
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('host')
  const [showVideoCall, setShowVideoCall] = useState(false)

  useEffect(() => {
    const room = searchParams.get('room')
    const role = searchParams.get('role') || 'host'
    if (room) {
      setRoomName(room)
    }
    if (user) {
      setUserName(user.name || 'User')
    }
    setUserRole(role)
  }, [searchParams, user])

  const handleJoinClass = async (e) => {
    e.preventDefault()
    if (!roomName.trim()) {
      alert('Please enter a room name')
      return
    }
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }
    
    // If user is a host, add to active classes
    if (userRole === 'host') {
      try {
        await addActiveClass({
          roomName: roomName.trim(),
          title: `Live Class: ${roomName}`,
          instructor: userName,
          userName: userName
        })
        // Notify parent window if it exists (for refreshing active classes list)
        if (window.opener) {
          window.opener.postMessage({ type: 'CLASS_STARTED', roomName: roomName.trim() }, '*')
        }
      } catch (error) {
        console.error('Error adding active class:', error)
      }
    }
    
    setShowVideoCall(true)
  }

  const shareLink = `${window.location.origin}/admin/live-class/join?room=${encodeURIComponent(roomName)}&role=viewer`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    alert('Link copied to clipboard!')
  }

  const handleCloseClass = async () => {
    // If user is a host, remove from active classes
    if (userRole === 'host' && roomName) {
      try {
        await removeActiveClassByRoom(roomName.trim())
        // Notify parent window if it exists
        if (window.opener) {
          window.opener.postMessage({ type: 'CLASS_ENDED', roomName: roomName.trim() }, '*')
        }
      } catch (error) {
        console.error('Error removing active class:', error)
      }
    }
    setShowVideoCall(false)
    navigate('/admin/pages')
  }

  if (showVideoCall) {
    return (
      <VideoCall
        roomName={roomName}
        userName={userName}
        userRole={userRole}
        onClose={handleCloseClass}
      />
    )
  }

  return (
    <div className="join-live-class-container">
      <div className="join-live-class-card">
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

        <div className="join-live-content">
          <h2 className="join-title">Join Live Class</h2>

          <form onSubmit={handleJoinClass} className="join-class-form">
            <div className="form-group">
              <label htmlFor="roomName">Room Name</label>
              <input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="userName">Your Name</label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <button type="submit" className="join-class-button">
              Join Class
            </button>
          </form>

          {roomName && (
            <div className="share-link-section">
              <h3 className="share-title">Share the link</h3>
              <div className="share-link-container">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="share-link-input"
                />
                <button type="button" className="copy-button" onClick={handleCopyLink}>
                  <span className="copy-icon">📋</span>
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JoinLiveClass

