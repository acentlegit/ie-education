// HTTPS Helper Utilities

/**
 * Get the current protocol (http or https)
 */
export const getProtocol = () => {
  if (typeof window !== 'undefined') {
    return window.location.protocol
  }
  return 'https:' // Default to HTTPS for SSR
}

/**
 * Check if site is using HTTPS
 */
export const isHTTPS = () => {
  return getProtocol() === 'https:'
}

/**
 * Check if site is using HTTP
 */
export const isHTTP = () => {
  return getProtocol() === 'http:'
}

/**
 * Get base URL with automatic protocol detection
 * If on HTTPS, returns HTTPS URL
 * If on HTTP, returns HTTP URL (but warns)
 */
export const getBaseURL = (fallbackURL = 'http://localhost:3001') => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    const hostname = window.location.hostname
    
    // For localhost, always use localhost:3001 for backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001'
    }
    
    // For S3 bucket URLs, use EC2 backend
    if (origin.includes('s3-website') || origin.includes('s3.amazonaws.com') || origin.includes('coaching-platformm')) {
      return 'http://98.92.71.17:3001'
    }
    
    // If frontend is HTTPS, use HTTPS for API
    if (isHTTPS()) {
      // If API is on same origin, use it
      if (origin.includes('98.92.71.17')) {
        return origin.replace(':3000', ':3001')
      }
      // Otherwise, convert fallback to HTTPS
      return fallbackURL.replace('http://', 'https://')
    }
    // If on HTTP, use HTTP backend URL
    if (origin.includes('98.92.71.17')) {
      return 'http://98.92.71.17:3001'
    }
    return fallbackURL
  }
  return fallbackURL
}

/**
 * Force HTTPS URL (converts http:// to https://)
 */
export const forceHTTPS = (url) => {
  if (!url) return url
  return url.replace(/^http:\/\//, 'https://')
}

/**
 * Get API URL with HTTPS preference
 */
export const getAPIURL = () => {
  const envURL = import.meta.env.VITE_API_URL
  
  // If no env URL is set, use same origin (CloudFront proxy)
  if (!envURL || envURL.trim() === '') {
    // Use relative URL - CloudFront will proxy /api/* to backend
    return ''
  }
  
  if (envURL) {
    // If env URL is set, use it as-is
    // Don't convert IP addresses to HTTPS (they don't have SSL certificates)
    // Only convert domain names to HTTPS if frontend is HTTPS
    if (isHTTPS() && envURL.startsWith('http://')) {
      // Check if URL contains an IP address (e.g., 98.92.71.17)
      const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
      if (ipPattern.test(envURL)) {
        // Keep HTTP for IP addresses (no SSL certificate)
        return envURL
      }
      // Convert domain names to HTTPS
      return forceHTTPS(envURL)
    }
    return envURL
  }
  
  // Auto-detect based on current page protocol
  return getBaseURL()
}

/**
 * Check if camera/microphone will work
 * Returns true if HTTPS, false if HTTP
 */
export const willCameraWork = () => {
  return isHTTPS()
}

/**
 * Get user-friendly protocol message
 */
export const getProtocolMessage = () => {
  if (isHTTPS()) {
    return {
      status: 'secure',
      message: 'Site is using HTTPS. Camera/microphone should work.',
      icon: '🔒'
    }
  } else {
    return {
      status: 'insecure',
      message: 'Site is using HTTP. Camera/microphone may be blocked by browser.',
      icon: '⚠️',
      solution: 'Set up HTTPS (CloudFront or serve from EC2 with Nginx)'
    }
  }
}


