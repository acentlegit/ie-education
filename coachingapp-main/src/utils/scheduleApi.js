// Schedule API service
export const getSchedules = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]')
      resolve(schedules)
    }, 500)
  })
}

export const createSchedule = async (scheduleData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]')
      const newSchedule = {
        id: Date.now(),
        ...scheduleData,
        status: 'upcoming',
        createdAt: new Date().toISOString()
      }
      schedules.push(newSchedule)
      localStorage.setItem('schedules', JSON.stringify(schedules))
      resolve(newSchedule)
    }, 500)
  })
}

export const updateSchedule = async (scheduleId, scheduleData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]')
      const index = schedules.findIndex(s => s.id === scheduleId)
      if (index !== -1) {
        schedules[index] = { ...schedules[index], ...scheduleData }
        localStorage.setItem('schedules', JSON.stringify(schedules))
        resolve(schedules[index])
      } else {
        resolve(null)
      }
    }, 500)
  })
}

export const deleteSchedule = async (scheduleId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]')
      const filtered = schedules.filter(s => s.id !== scheduleId)
      localStorage.setItem('schedules', JSON.stringify(filtered))
      resolve({ success: true })
    }, 500)
  })
}

// Initialize with sample schedules
export const initializeSchedules = () => {
  const schedules = JSON.parse(localStorage.getItem('schedules') || '[]')
  if (schedules.length === 0) {
    const sampleSchedules = [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp - Week 2 Session 1',
        courseId: 1,
        courseTitle: 'Complete Web Development Bootcamp',
        date: '2025-12-15',
        time: '10:00',
        duration: '90 mins',
        instructor: 'Dr. Sarah Johnson',
        description: 'HTML and CSS fundamentals review',
        status: 'upcoming',
        roomName: 'web-dev-week2-session1'
      },
      {
        id: 2,
        title: 'Advanced React Development - Module 3',
        courseId: 1,
        courseTitle: 'Complete Web Development Bootcamp',
        date: '2025-12-16',
        time: '14:00',
        duration: '120 mins',
        instructor: 'Mike Chen',
        description: 'React hooks deep dive',
        status: 'upcoming',
        roomName: 'react-module3'
      },
      {
        id: 3,
        title: 'Python for Data Science - Week 4 Lab',
        courseId: 2,
        courseTitle: 'Data Science & Machine Learning',
        date: '2025-12-17',
        time: '11:00',
        duration: '150 mins',
        instructor: 'Dr. Emily Rodriguez',
        description: 'Pandas and NumPy practical exercises',
        status: 'upcoming',
        roomName: 'python-ds-week4'
      }
    ]
    localStorage.setItem('schedules', JSON.stringify(sampleSchedules))
  }
}













