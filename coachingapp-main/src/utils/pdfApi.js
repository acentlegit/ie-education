// PDF API service for managing PDFs in the coaching platform
// Uses localStorage for demo purposes (in production, use cloud storage)

// Convert file to base64 for storage
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// Convert base64 to blob for download
const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

// Upload PDF to storage
export const uploadPDF = async (file, moduleId, courseId) => {
  try {
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Please upload a valid PDF file')
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('PDF file size must be less than 10MB')
    }

    const base64 = await fileToBase64(file)
    const pdfData = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      data: base64,
      moduleId,
      courseId,
      uploadedAt: new Date().toISOString()
    }

    // Store in localStorage
    const pdfs = JSON.parse(localStorage.getItem('course_pdfs') || '[]')
    pdfs.push(pdfData)
    localStorage.setItem('course_pdfs', JSON.stringify(pdfs))

    return pdfData
  } catch (error) {
    console.error('Error uploading PDF:', error)
    throw error
  }
}

// Get PDFs for a specific module
export const getModulePDFs = async (moduleId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pdfs = JSON.parse(localStorage.getItem('course_pdfs') || '[]')
      const modulePDFs = pdfs.filter(pdf => pdf.moduleId === moduleId)
      resolve(modulePDFs)
    }, 100)
  })
}

// Get all PDFs for a course
export const getCoursePDFs = async (courseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pdfs = JSON.parse(localStorage.getItem('course_pdfs') || '[]')
      const coursePDFs = pdfs.filter(pdf => pdf.courseId === courseId)
      resolve(coursePDFs)
    }, 100)
  })
}

// Delete PDF
export const deletePDF = async (pdfId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pdfs = JSON.parse(localStorage.getItem('course_pdfs') || '[]')
      const filtered = pdfs.filter(pdf => pdf.id !== pdfId)
      localStorage.setItem('course_pdfs', JSON.stringify(filtered))
      resolve(true)
    }, 100)
  })
}

// Download PDF
export const downloadPDF = (pdfData) => {
  try {
    const blob = base64ToBlob(pdfData.data, pdfData.type)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = pdfData.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    throw error
  }
}

// View PDF in new window
export const viewPDF = (pdfData) => {
  try {
    const blob = base64ToBlob(pdfData.data, pdfData.type)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    console.error('Error viewing PDF:', error)
    throw error
  }
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}













