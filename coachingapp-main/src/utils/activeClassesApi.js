// Active Classes API - Track currently running live classes
// Uses localStorage for persistence

export const getActiveClasses = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeClasses = JSON.parse(localStorage.getItem('active_classes') || '[]')
      // Filter out classes that are older than 24 hours (auto-cleanup)
      const now = Date.now()
      const filtered = activeClasses.filter(ac => {
        const startTime = new Date(ac.startedAt).getTime()
        return (now - startTime) < 24 * 60 * 60 * 1000 // 24 hours
      })
      if (filtered.length !== activeClasses.length) {
        localStorage.setItem('active_classes', JSON.stringify(filtered))
      }
      resolve(filtered)
    }, 100)
  })
}

export const addActiveClass = async (classData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeClasses = JSON.parse(localStorage.getItem('active_classes') || '[]')
      const newClass = {
        id: Date.now(),
        roomName: classData.roomName || classData.room || 'room-' + Date.now(),
        title: classData.title || 'Live Class',
        instructor: classData.instructor || classData.userName || 'Admin',
        startedAt: new Date().toISOString(),
        participants: classData.participants || 0,
        courseId: classData.courseId || null,
        courseTitle: classData.courseTitle || null
      }
      activeClasses.push(newClass)
      localStorage.setItem('active_classes', JSON.stringify(activeClasses))
      resolve(newClass)
    }, 100)
  })
}

export const removeActiveClass = async (classId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeClasses = JSON.parse(localStorage.getItem('active_classes') || '[]')
      const filtered = activeClasses.filter(ac => ac.id !== classId)
      localStorage.setItem('active_classes', JSON.stringify(filtered))
      resolve({ success: true })
    }, 100)
  })
}

export const removeActiveClassByRoom = async (roomName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeClasses = JSON.parse(localStorage.getItem('active_classes') || '[]')
      const filtered = activeClasses.filter(ac => ac.roomName !== roomName)
      localStorage.setItem('active_classes', JSON.stringify(filtered))
      resolve({ success: true })
    }, 100)
  })
}

export const updateActiveClassParticipants = async (roomName, participantCount) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeClasses = JSON.parse(localStorage.getItem('active_classes') || '[]')
      const updated = activeClasses.map(ac => {
        if (ac.roomName === roomName) {
          return { ...ac, participants: participantCount }
        }
        return ac
      })
      localStorage.setItem('active_classes', JSON.stringify(updated))
      resolve(updated.find(ac => ac.roomName === roomName))
    }, 100)
  })
}













