import { useState, useEffect, useRef } from 'react'
import { Room, RoomEvent, Track, createLocalTracks, createLocalScreenTracks } from 'livekit-client'
import { getToken } from '../utils/livekitApi'
import './VideoCall.css'

const VideoCall = ({ roomName, userName, userRole = 'host', onClose }) => {
  const [room, setRoom] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState([])
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const videoContainerRef = useRef(null)
  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect()
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [room])

  const connectToRoom = async () => {
    try {
      // Note: Camera may not work on HTTP - browser will handle permissions

      // Try to get token from backend
      let token, url
      try {
        const tokenData = await getToken(userName, roomName, userRole)
        token = tokenData.token
        url = tokenData.url
      } catch (error) {
        console.warn('Backend not available, using mock mode')
        // Use mock mode - show UI without actual LiveKit connection
        setIsConnected(true)
        startLocalMedia()
        return
      }

      // Check if we got a valid token
      if (!token || token === 'demo_token') {
        console.warn('Invalid token, using mock mode')
        setIsConnected(true)
        startLocalMedia()
        return
      }
      
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      })

      newRoom.on(RoomEvent.Connected, () => {
        console.log('Connected to room')
        setIsConnected(true)
      })

      newRoom.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room')
        setIsConnected(false)
      })

      newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('Participant connected:', participant.identity)
        updateParticipants(newRoom)
      })

      newRoom.on(RoomEvent.ParticipantDisconnected, () => {
        updateParticipants(newRoom)
      })

      newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('Track subscribed:', {
          kind: track.kind,
          source: publication.source,
          participant: participant.identity,
          isMuted: publication.isMuted
        })
        if (track.kind === Track.Kind.Video) {
          const isScreenShare = publication.source === Track.Source.ScreenShare
          console.log('Attaching video track:', { isScreenShare, participant: participant.identity })
          attachTrack(track, participant, isScreenShare)
        }
      })

      // Handle chat messages
      newRoom.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
        if (topic === 'chat') {
          try {
            const message = JSON.parse(new TextDecoder().decode(payload))
            setChatMessages(prev => [...prev, {
              ...message,
              sender: participant?.identity || 'Unknown',
              timestamp: new Date()
            }])
          } catch (error) {
            console.error('Error parsing chat message:', error)
          }
        }
      })

      newRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        console.log('Track unsubscribed:', { kind: track.kind, participant: participant.identity })
      })

      newRoom.on(RoomEvent.LocalTrackPublished, (publication, participant) => {
        console.log('Local track published:', { source: publication.source, kind: publication.kind })
        // Attach local tracks immediately when published
        if (publication.track) {
          if (publication.kind === Track.Kind.Video) {
            console.log('Attaching local video track')
            attachTrack(publication.track, participant, publication.source === Track.Source.ScreenShare)
          }
        }
      })

      newRoom.on(RoomEvent.TrackPublished, (publication, participant) => {
        console.log('Track published:', { 
          source: publication.source, 
          kind: publication.kind,
          participant: participant.identity 
        })
      })

      await newRoom.connect(url, token)
      setRoom(newRoom)

      // Publish local tracks if not viewer
      if (userRole !== 'viewer') {
        try {
          console.log('Creating local tracks...')
          const tracks = await createLocalTracks({
            audio: true,
            video: true,
          })
          console.log('Local tracks created:', tracks.length, tracks.map(t => ({ kind: t.kind, source: t.source })))
          tracks.forEach((track) => {
            console.log('Publishing track:', { kind: track.kind, source: track.source })
            newRoom.localParticipant.publishTrack(track)
            // Attach video tracks immediately
            if (track.kind === Track.Kind.Video) {
              console.log('Attaching local video track immediately')
              attachTrack(track, newRoom.localParticipant, track.source === Track.Source.ScreenShare)
            }
          })
        } catch (trackError) {
          console.error('Could not create local tracks:', trackError)
          let errorMessage = 'Could not access camera/microphone.\n\n'
          
          // Check if it's a permission error
          if (trackError.name === 'NotAllowedError' || trackError.name === 'PermissionDeniedError') {
            errorMessage += 'Please allow camera/microphone access in your browser settings.\n\n'
            errorMessage += 'To enable camera:\n'
            errorMessage += '1. Click the lock icon in your browser address bar\n'
            errorMessage += '2. Go to Site settings\n'
            errorMessage += '3. Allow Camera and Microphone\n'
            errorMessage += '4. Refresh the page and try again'
          } else if (trackError.name === 'NotFoundError' || trackError.name === 'DevicesNotFoundError') {
            errorMessage += 'No camera/microphone found. Please connect a device.'
          } else if (trackError.name === 'NotReadableError' || trackError.name === 'TrackStartError') {
            errorMessage += 'Camera/microphone is already in use by another application.\n'
            errorMessage += 'Please close other apps using the camera and try again.'
          } else {
            errorMessage += `Error: ${trackError.message}\n\n`
            errorMessage += 'Possible causes:\n'
            errorMessage += '1. Browser permissions not granted\n'
            errorMessage += '2. Camera/microphone already in use\n'
            errorMessage += '3. Device not connected'
          }
          
          alert(errorMessage)
        }
      }

      updateParticipants(newRoom)
    } catch (error) {
      console.error('Error connecting to room:', error)
      // Fallback to mock mode
      setIsConnected(true)
      startLocalMedia()
    }
  }

  const startLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      localStreamRef.current = stream
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      // Add local participant to video grid
      if (videoContainerRef.current) {
        const container = document.createElement('div')
        container.className = 'video-participant local'
        container.id = 'participant-local'
        const video = document.createElement('video')
        video.autoplay = true
        video.playsInline = true
        video.srcObject = stream
        video.className = 'local-video'
        container.appendChild(video)
        videoContainerRef.current.appendChild(container)
        localVideoRef.current = video
      }
    } catch (error) {
      console.warn('Could not access camera/microphone:', error)
      // Show placeholder even without media
      if (videoContainerRef.current) {
        const container = document.createElement('div')
        container.className = 'video-participant placeholder'
        container.id = 'participant-local'
        container.innerHTML = '<div class="video-placeholder">📹</div>'
        videoContainerRef.current.appendChild(container)
      }
    }
  }

  const attachTrack = (track, participant, isScreenShare = false) => {
    console.log('attachTrack called:', { 
      trackKind: track.kind, 
      participant: participant?.identity || 'local', 
      isScreenShare,
      hasContainer: !!videoContainerRef.current,
      trackSource: track.source
    })
    
    if (!videoContainerRef.current) {
      console.error('Video container not found!')
      return
    }

    // Only attach video tracks
    if (track.kind !== Track.Kind.Video) {
      console.log('Skipping non-video track')
      return
    }

    try {
      const element = track.attach()
      console.log('Track attached, element:', element, 'tagName:', element.tagName)
      
      // Ensure element is a video element
      if (element.tagName !== 'VIDEO') {
        console.error('Track element is not a video element:', element.tagName)
        return
      }
      
      // Set video attributes
      element.autoplay = true
      element.playsInline = true
      element.muted = true // Mute local video to avoid feedback
      
      const containerId = isScreenShare ? 'screen-share' : `participant-${participant?.identity || 'local'}`
      const existingContainer = document.getElementById(containerId)
      if (existingContainer) {
        console.log('Removing existing container:', containerId)
        existingContainer.remove()
      }
      
      const container = document.createElement('div')
      container.className = isScreenShare ? 'video-participant screen-share' : 'video-participant'
      if (participant?.identity === userName || !participant) {
        container.className += ' local'
      }
      container.id = containerId
      
      // Add participant name label
      const nameLabel = document.createElement('div')
      nameLabel.className = 'participant-name'
      nameLabel.textContent = participant?.identity || userName || 'You'
      container.appendChild(nameLabel)
      
      container.appendChild(element)
      
      if (isScreenShare) {
        const label = document.createElement('div')
        label.className = 'screen-share-label'
        label.textContent = 'Screen Share'
        container.appendChild(label)
        setIsScreenSharing(true)
      }
      
      videoContainerRef.current.appendChild(container)
      console.log('Track attached successfully to container:', containerId)
      
      // Force play the video
      element.play().catch(err => {
        console.warn('Error playing video:', err)
      })
    } catch (error) {
      console.error('Error attaching track:', error)
    }
  }

  const updateParticipants = (currentRoom) => {
    const allParticipants = [currentRoom.localParticipant, ...Array.from(currentRoom.remoteParticipants.values())]
    setParticipants(allParticipants)
  }

  const toggleMute = async () => {
    if (room) {
      const audioTrack = room.localParticipant.audioTrackPublications.values().next().value
      if (audioTrack) {
        await audioTrack.track.setEnabled(!audioTrack.track.isEnabled())
        setIsMuted(!audioTrack.track.isEnabled())
      }
    } else if (localStreamRef.current) {
      // Mock mode
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
        setIsMuted(!track.enabled)
      })
    }
  }

  const toggleVideo = async () => {
    if (room) {
      const videoTrack = room.localParticipant.videoTrackPublications.values().next().value
      if (videoTrack) {
        await videoTrack.track.setEnabled(!videoTrack.track.isEnabled())
        setIsVideoOn(!videoTrack.track.isEnabled())
      }
    } else if (localStreamRef.current) {
      // Mock mode
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !track.enabled
        setIsVideoOn(track.enabled)
      })
    }
  }

  const startScreenShare = async () => {
    if (room && !isScreenSharing) {
      try {
        const screenTracks = await createLocalScreenTracks({ audio: true })
        screenTracks.forEach((track) => {
          room.localParticipant.publishTrack(track, { source: Track.Source.ScreenShare })
        })
        setIsScreenSharing(true)
      } catch (error) {
        console.error('Error starting screen share:', error)
      }
    } else if (!room && !isScreenSharing) {
      // Mock mode
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        if (videoContainerRef.current) {
          // Remove existing screen share if any
          const existing = document.getElementById('screen-share')
          if (existing) existing.remove()
          
          const container = document.createElement('div')
          container.className = 'video-participant screen-share'
          container.id = 'screen-share'
          const video = document.createElement('video')
          video.autoplay = true
          video.playsInline = true
          video.srcObject = stream
          container.appendChild(video)
          
          // Add label
          const label = document.createElement('div')
          label.className = 'screen-share-label'
          label.textContent = 'Screen Share'
          container.appendChild(label)
          
          videoContainerRef.current.appendChild(container)
          setIsScreenSharing(true)
          
          // Handle stream end
          stream.getVideoTracks()[0].onended = () => {
            stopScreenShare()
          }
        }
      } catch (error) {
        console.error('Error starting screen share:', error)
      }
    }
  }

  const stopScreenShare = async () => {
    if (room && isScreenSharing) {
      room.localParticipant.videoTrackPublications.forEach((publication) => {
        if (publication.source === Track.Source.ScreenShare) {
          room.localParticipant.unpublishTrack(publication.track)
        }
      })
      setIsScreenSharing(false)
    } else {
      // Mock mode
      const screenShareEl = document.getElementById('screen-share')
      if (screenShareEl) {
        const video = screenShareEl.querySelector('video')
        if (video && video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop())
        }
        screenShareEl.remove()
      }
      setIsScreenSharing(false)
    }
  }

  const leaveRoom = async () => {
    if (room) {
      await room.disconnect()
      setRoom(null)
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }
    setIsConnected(false)
    if (onClose) {
      onClose()
    }
  }

  const sendChatMessage = (text) => {
    if (room && text.trim()) {
      try {
        const message = {
          text: text.trim(),
          sender: userName,
          timestamp: new Date().toISOString()
        }
        const encoder = new TextEncoder()
        room.localParticipant.publishData(
          encoder.encode(JSON.stringify(message)),
          { reliable: true, topic: 'chat' }
        )
        // Add to local messages immediately
        setChatMessages(prev => [...prev, {
          ...message,
          sender: userName,
          timestamp: new Date()
        }])
      } catch (error) {
        console.error('Error sending chat message:', error)
      }
    }
  }

  const participantCount = isConnected ? (room ? participants.length : 1) : 0

  return (
    <div className="video-call-container">
      <div className="video-call-header">
        <div className="header-left">
          <span className="header-icon">👥📹</span>
          <h3>Live Class</h3>
        </div>
        <div className="header-right">
          {isConnected && (
            <div className="connection-status">
              <span className="status-dot"></span>
              <span>Connected</span>
            </div>
          )}
          <span className="user-name-header">{userName}</span>
          <button className="back-btn" onClick={leaveRoom}>Back</button>
        </div>
      </div>

      <div className="video-call-content">
        {!isConnected ? (
          <div className="video-call-join">
            <p>Ready to join the live class?</p>
            <p className="room-info">Room: {roomName}</p>
            <button className="join-btn" onClick={connectToRoom}>
              Join Class
            </button>
            <p className="connection-hint">
              Click "Join Class" to start. The interface will work even if the backend server is not running.
            </p>
          </div>
        ) : (
          <>
            <div className="control-panel">
              <div className="room-info-panel">
                <span className="room-label">Room: {roomName}</span>
                <span className="live-badge">
                  <span className="live-dot"></span>
                  LIVE
                </span>
                <span className="participants-icon">👥</span>
                <span className="participant-count">{participantCount}</span>
              </div>
              <div className="control-buttons">
                <button 
                  onClick={toggleMute} 
                  className={`control-btn ${isMuted ? 'muted' : 'mic-on'}`}
                >
                  <span className="btn-icon">🎤</span>
                  {isMuted ? 'Mic Off' : 'Mic On'}
                </button>
                <button 
                  onClick={toggleVideo} 
                  className={`control-btn ${isVideoOn ? 'camera-on' : 'camera-off'}`}
                >
                  <span className="btn-icon">📹</span>
                  {isVideoOn ? 'Camera On' : 'Camera Off'}
                </button>
                {userRole !== 'viewer' && (
                  <>
                    {!isScreenSharing ? (
                      <button onClick={startScreenShare} className="control-btn share-screen">
                        <span className="btn-icon">🖥️</span>
                        Share Screen
                      </button>
                    ) : (
                      <button onClick={stopScreenShare} className="control-btn stop-share">
                        <span className="btn-icon">🛑</span>
                        Stop Share
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setShowChat(!showChat)} className="control-btn chat">
                  <span className="btn-icon">💬</span>
                  Chat
                </button>
                <button onClick={leaveRoom} className="control-btn leave">
                  <span className="btn-icon">📞</span>
                  Leave
                </button>
              </div>
            </div>

            <div ref={videoContainerRef} className="video-grid"></div>

            {showChat && (
              <div className="chat-panel">
                <div className="chat-header">
                  <h4>Chat</h4>
                  <button onClick={() => setShowChat(false)}>✕</button>
                </div>
                <div className="chat-messages">
                  <p className="chat-message">Welcome to the live class!</p>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="chat-message">
                      <strong>{msg.sender}:</strong> {msg.text}
                      <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
                <div className="chat-input-container">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="chat-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        sendChatMessage(chatInput)
                        setChatInput('')
                      }
                    }}
                  />
                  <button 
                    className="chat-send-btn"
                    onClick={() => {
                      if (chatInput.trim()) {
                        sendChatMessage(chatInput)
                        setChatInput('')
                      }
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default VideoCall
