// User API service
export const getUsers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get users from localStorage or use default users
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
      if (storedUsers.length === 0) {
        // Initialize with default users
        const defaultUsers = [
          {
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            name: 'Admin User',
            email: 'admin@educoach.com',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            username: 'coach1',
            password: 'coach123',
            role: 'coach',
            name: 'Dr. Sarah Johnson',
            email: 'coach1@coaching.com',
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            username: 'student1',
            password: 'student123',
            role: 'student',
            name: 'Alex Martinez',
            email: 'student1@educoach.com',
            createdAt: new Date().toISOString()
          },
          {
            id: 4,
            username: 'coach2',
            password: 'coach123',
            role: 'coach',
            name: 'Prof. Michael Chen',
            email: 'michael.chen@coaching.com',
            createdAt: new Date().toISOString()
          },
          {
            id: 5,
            username: 'student2',
            password: 'student123',
            role: 'student',
            name: 'Emma Wilson',
            email: 'emma.wilson@educoach.com',
            createdAt: new Date().toISOString()
          },
          {
            id: 6,
            username: 'student3',
            password: 'student123',
            role: 'student',
            name: 'James Brown',
            email: 'james.brown@educoach.com',
            createdAt: new Date().toISOString()
          }
        ]
        localStorage.setItem('users', JSON.stringify(defaultUsers))
        resolve(defaultUsers)
      } else {
        resolve(storedUsers)
      }
    }, 300)
  })
}

export const createUser = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      // Generate sequential ID based on highest existing ID
      const maxId = users.length > 0 ? Math.max(...users.map(u => parseInt(u.id) || 0)) : 0
      const newUser = {
        id: maxId + 1,
        ...userData,
        createdAt: new Date().toISOString()
      }
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      resolve(newUser)
    }, 300)
  })
}

export const updateUser = async (userId, userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const index = users.findIndex(u => u.id === userId)
      if (index !== -1) {
        users[index] = { ...users[index], ...userData }
        localStorage.setItem('users', JSON.stringify(users))
        resolve(users[index])
      } else {
        resolve(null)
      }
    }, 300)
  })
}

export const deleteUser = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const filtered = users.filter(u => u.id !== userId)
      localStorage.setItem('users', JSON.stringify(filtered))
      resolve({ success: true })
    }, 300)
  })
}

