// Course API service
export const getCourses = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const courses = JSON.parse(localStorage.getItem('courses') || '[]')
      resolve(courses)
    }, 500)
  })
}

export const createCourse = async (courseData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const courses = JSON.parse(localStorage.getItem('courses') || '[]')
      const newCourse = {
        id: Date.now(),
        ...courseData,
        createdAt: new Date().toISOString(),
        students: [],
        schedules: []
      }
      courses.push(newCourse)
      localStorage.setItem('courses', JSON.stringify(courses))
      resolve(newCourse)
    }, 500)
  })
}

export const updateCourse = async (courseId, courseData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const courses = JSON.parse(localStorage.getItem('courses') || '[]')
      const courseIdNum = parseInt(courseId)
      const index = courses.findIndex(c => {
        return c.id === courseIdNum || c.id === courseId || String(c.id) === String(courseId)
      })
      if (index !== -1) {
        // Deep merge to ensure curriculum and other nested objects are properly updated
        const existingCourse = courses[index]
        const updatedCourse = {
          ...existingCourse,
          ...courseData,
          // Ensure curriculum is properly preserved - use the new one if provided, otherwise keep existing
          curriculum: courseData.curriculum !== undefined 
            ? (Array.isArray(courseData.curriculum) ? courseData.curriculum : [])
            : (existingCourse.curriculum && Array.isArray(existingCourse.curriculum) ? existingCourse.curriculum : [])
        }
        courses[index] = updatedCourse
        localStorage.setItem('courses', JSON.stringify(courses))
        // Return a deep copy to avoid reference issues
        resolve(JSON.parse(JSON.stringify(updatedCourse)))
      } else {
        console.error('Course not found for update:', courseId)
        resolve(null)
      }
    }, 100) // Reduced timeout for faster response
  })
}

export const deleteCourse = async (courseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const courses = JSON.parse(localStorage.getItem('courses') || '[]')
      const filtered = courses.filter(c => c.id !== courseId)
      localStorage.setItem('courses', JSON.stringify(filtered))
      resolve({ success: true })
    }, 500)
  })
}

// Initialize with sample data if empty
export const initializeCourses = () => {
  let courses = JSON.parse(localStorage.getItem('courses') || '[]')
  // Reset to 5 courses if empty or if we want to force reset
  if (courses.length === 0) {
    const sampleCourses = [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        description: 'Master HTML, CSS, JavaScript, React, Node.js and become a full-stack developer',
        level: 'Beginner to Advanced',
        duration: '12 weeks',
        price: '$2999',
        category: 'Web Development',
        learningObjectives: [
          'Master fundamental concepts',
          'Build real-world projects',
          'Gain industry-relevant skills',
          'Prepare for career advancement'
        ],
        prerequisites: [
          'Basic computer skills',
          'Internet connection'
        ],
        coach: {
          name: 'Dr. Sarah Johnson',
          specialization: 'Web Development'
        },
        students: [],
        schedules: [],
        contentPages: 5,
        curriculum: [
          {
            id: 1,
            title: 'HTML & CSS Fundamentals',
            description: 'Learn the basics of HTML structure and CSS styling',
            pageId: null,
            lessons: [
              { id: 1, title: 'Introduction to HTML', completed: true },
              { id: 2, title: 'HTML Elements and Attributes', completed: true },
              { id: 3, title: 'CSS Basics', completed: true },
              { id: 4, title: 'CSS Selectors', completed: true },
              { id: 5, title: 'Layout with Flexbox', completed: true },
              { id: 6, title: 'Responsive Design', completed: true },
              { id: 7, title: 'CSS Grid', completed: true },
              { id: 8, title: 'Project: Build a Landing Page', completed: true }
            ],
            completedLessons: 8,
            totalLessons: 8
          },
          {
            id: 2,
            title: 'JavaScript Basics',
            description: 'Master JavaScript fundamentals and programming concepts',
            pageId: null,
            lessons: [
              { id: 9, title: 'Variables and Data Types', completed: false },
              { id: 10, title: 'Functions and Scope', completed: false },
              { id: 11, title: 'Arrays and Objects', completed: false }
            ],
            completedLessons: 0,
            totalLessons: 3
          }
        ],
        averageRating: 4.8,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Data Science & Machine Learning',
        description: 'Learn Python, pandas, scikit-learn, and TensorFlow to build intelligent data-driven applications',
        level: 'Intermediate',
        duration: '16 weeks',
        price: '$3499',
        category: 'Data Science',
        learningObjectives: [
          'Master Python for data analysis',
          'Build machine learning models',
          'Work with real datasets',
          'Deploy ML solutions'
        ],
        prerequisites: [
          'Basic programming knowledge',
          'Mathematics fundamentals'
        ],
        coach: {
          name: 'Prof. Michael Chen',
          specialization: 'Data Science'
        },
        students: [],
        schedules: [],
        contentPages: 8,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Mobile App Development with Flutter',
        description: 'Build cross-platform mobile applications for iOS and Android using Flutter and Dart',
        level: 'Beginner',
        duration: '10 weeks',
        price: '$2499',
        category: 'Mobile Development',
        learningObjectives: [
          'Learn Flutter framework',
          'Build responsive UIs',
          'Integrate APIs and databases',
          'Publish apps to stores'
        ],
        prerequisites: [
          'Basic programming concepts',
          'Computer with internet'
        ],
        coach: {
          name: 'Emily Rodriguez',
          specialization: 'Mobile Development'
        },
        students: [],
        schedules: [],
        contentPages: 6,
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        title: 'Cybersecurity Fundamentals',
        description: 'Comprehensive course covering network security, ethical hacking, and security best practices',
        level: 'Advanced',
        duration: '14 weeks',
        price: '$3999',
        category: 'Cybersecurity',
        learningObjectives: [
          'Understand security threats',
          'Implement security measures',
          'Perform ethical hacking',
          'Secure networks and systems'
        ],
        prerequisites: [
          'Networking basics',
          'Linux command line',
          'Programming experience'
        ],
        coach: {
          name: 'James Wilson',
          specialization: 'Cybersecurity'
        },
        students: [],
        schedules: [],
        contentPages: 10,
        createdAt: new Date().toISOString()
      },
      {
        id: 5,
        title: 'UI/UX Design Masterclass',
        description: 'Learn design principles, user research, prototyping, and create beautiful user interfaces',
        level: 'Beginner to Intermediate',
        duration: '8 weeks',
        price: '$1999',
        category: 'Design',
        learningObjectives: [
          'Master design principles',
          'Conduct user research',
          'Create wireframes and prototypes',
          'Design with Figma and Adobe XD'
        ],
        prerequisites: [
          'Creative mindset',
          'Basic computer skills'
        ],
        coach: {
          name: 'Sophie Anderson',
          specialization: 'UI/UX Design'
        },
        students: [],
        schedules: [],
        contentPages: 7,
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('courses', JSON.stringify(sampleCourses))
  }
}

// Reset courses to initial 5 courses
export const resetCourses = () => {
  localStorage.removeItem('courses')
  initializeCourses()
}

