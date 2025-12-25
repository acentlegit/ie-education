// Recordings API - Track video recordings
// Uses localStorage for persistence

export const getRecordings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recordings = JSON.parse(localStorage.getItem('recordings') || '[]')
      resolve(recordings)
    }, 100)
  })
}

export const getRecordingsCount = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recordings = JSON.parse(localStorage.getItem('recordings') || '[]')
      resolve(recordings.length)
    }, 100)
  })
}

export const createRecording = async (recordingData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recordings = JSON.parse(localStorage.getItem('recordings') || '[]')
      const newRecording = {
        id: Date.now(),
        roomName: recordingData.roomName,
        title: recordingData.title || `Recording - ${recordingData.roomName}`,
        duration: recordingData.duration || '0:00',
        createdAt: new Date().toISOString(),
        fileSize: recordingData.fileSize || 0,
        status: recordingData.status || 'completed'
      }
      recordings.push(newRecording)
      localStorage.setItem('recordings', JSON.stringify(recordings))
      resolve(newRecording)
    }, 100)
  })
}

export const deleteRecording = async (recordingId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recordings = JSON.parse(localStorage.getItem('recordings') || '[]')
      const filtered = recordings.filter(r => r.id !== recordingId)
      localStorage.setItem('recordings', JSON.stringify(filtered))
      resolve({ success: true })
    }, 100)
  })
}

// Initialize with sample recordings if empty
export const initializeRecordings = () => {
  const recordings = JSON.parse(localStorage.getItem('recordings') || '[]')
  if (recordings.length === 0) {
    const sampleRecordings = [
      {
        id: 1,
        roomName: 'math-101',
        title: 'Math Basics - Session 1',
        duration: '45:30',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fileSize: 125000000, // 125 MB
        status: 'completed'
      },
      {
        id: 2,
        roomName: 'python-intro',
        title: 'Python Introduction',
        duration: '60:15',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        fileSize: 180000000, // 180 MB
        status: 'completed'
      },
      {
        id: 3,
        roomName: 'web-dev-101',
        title: 'Web Development Basics',
        duration: '55:20',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        fileSize: 150000000, // 150 MB
        status: 'completed'
      }
    ]
    localStorage.setItem('recordings', JSON.stringify(sampleRecordings))
  }
}













