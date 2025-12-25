// Mock API service for pages
export const getPages = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const pages = JSON.parse(localStorage.getItem('pages') || '[]')
      resolve(pages)
    }, 500)
  })
}

export const createPage = async (pageData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pages = JSON.parse(localStorage.getItem('pages') || '[]')
      // Generate sequential ID based on highest existing ID
      const maxId = pages.length > 0 ? Math.max(...pages.map(p => parseInt(p.id) || 0)) : 0
      const newPage = {
        id: maxId + 1,
        ...pageData,
        course: pageData.course || null,
        createdAt: new Date().toISOString()
      }
      pages.push(newPage)
      localStorage.setItem('pages', JSON.stringify(pages))
      resolve(newPage)
    }, 500)
  })
}

// Initialize with sample pages if empty
export const initializePages = () => {
  const pages = JSON.parse(localStorage.getItem('pages') || '[]')
  if (pages.length === 0) {
    const samplePages = [
      {
        id: 1,
        title: 'Introduction to HTML',
        content: 'Learn the basics of HTML structure and elements',
        course: '1',
        status: 'Draft',
        pageType: 'Lesson',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'CSS Styling Fundamentals',
        content: 'Master CSS styling and layout techniques',
        course: '1',
        status: 'Draft',
        pageType: 'Lesson',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'JavaScript Basics',
        content: 'Introduction to JavaScript programming',
        course: '1',
        status: 'Draft',
        pageType: 'page',
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        title: 'React Framework',
        content: 'Building modern UIs with React',
        course: '1',
        status: 'Draft',
        pageType: 'page',
        createdAt: new Date().toISOString()
      },
      {
        id: 5,
        title: 'Node.js Backend',
        content: 'Server-side development with Node.js',
        course: '1',
        status: 'Draft',
        pageType: 'page',
        createdAt: new Date().toISOString()
      },
      {
        id: 6,
        title: 'Python for Data Science',
        content: 'Data analysis with Python',
        course: '2',
        status: 'Draft',
        pageType: 'Lesson',
        createdAt: new Date().toISOString()
      },
      {
        id: 7,
        title: 'Statistics & Probability',
        content: 'Statistical analysis fundamentals',
        course: '2',
        status: 'Draft',
        pageType: 'Lesson',
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('pages', JSON.stringify(samplePages))
  }
}

export const searchPages = async (title, pageId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pages = JSON.parse(localStorage.getItem('pages') || '[]')
      let filtered = pages
      
      if (title) {
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(title.toLowerCase())
        )
      }
      
      if (pageId) {
        filtered = filtered.filter(p => 
          p.id.toString().includes(pageId)
        )
      }
      
      resolve(filtered)
    }, 500)
  })
}

export const deletePage = async (pageId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pages = JSON.parse(localStorage.getItem('pages') || '[]')
      const filtered = pages.filter(p => p.id !== pageId)
      localStorage.setItem('pages', JSON.stringify(filtered))
      resolve({ success: true })
    }, 500)
  })
}

export const updatePage = async (pageId, pageData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pages = JSON.parse(localStorage.getItem('pages') || '[]')
      const index = pages.findIndex(p => p.id === pageId)
      if (index !== -1) {
        pages[index] = { ...pages[index], ...pageData }
        localStorage.setItem('pages', JSON.stringify(pages))
        resolve(pages[index])
      } else {
        resolve(null)
      }
    }, 500)
  })
}

export const getPageById = async (pageId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pages = JSON.parse(localStorage.getItem('pages') || '[]')
      const page = pages.find(p => p.id === pageId)
      resolve(page || null)
    }, 100)
  })
}


