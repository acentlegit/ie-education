// Import user API for consistency
import { getUsers } from './userApi'
import axios from 'axios'
import { getAPIURL } from './httpsHelper'

const API_BASE_URL = getAPIURL()
console.log('API Base URL:', API_BASE_URL || '(same origin)')

export const login = async (username, password, role) => {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/login` : '/api/auth/login'
    console.log('Login API URL:', url)
    // Call backend login API
    const response = await axios.post(url, {
      username,
      password,
      role
    })
    
    if (response.data.success) {
      // Store user in localStorage
      localStorage.setItem('authUser', JSON.stringify(response.data.user))
      return { success: true, user: response.data.user }
    }
    
    return { success: false, error: response.data.error || 'Invalid credentials' }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Login failed'
    }
  }
}

export const register = async (userData) => {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/register` : '/api/auth/register'
    const response = await axios.post(url, userData)
    return response.data
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Registration failed'
    }
  }
}

export const requestPasswordReset = async (email) => {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/reset-password` : '/api/auth/reset-password'
    const response = await axios.post(url, { email })
    return response.data
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to send reset link'
    }
  }
}

export const resetPasswordWithToken = async (token, username, newPassword) => {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/reset-password/confirm` : '/api/auth/reset-password/confirm'
    const response = await axios.post(url, {
      token,
      username,
      newPassword
    })
    return response.data
  } catch (error) {
    console.error('Password reset confirmation error:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to reset password'
    }
  }
}

// Reset password without token (using username + newPassword directly)
export const resetPasswordDirect = async (username, newPassword) => {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/reset-password` : '/api/auth/reset-password'
    console.log('Reset Password API URL:', url)
    const response = await axios.post(url, {
      username,
      newPassword
    })
    return response.data
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to reset password'
    }
  }
}

export const logout = () => {
  localStorage.removeItem('authUser')
}

export const getAuthUser = () => {
  const userStr = localStorage.getItem('authUser')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => {
  return getAuthUser() !== null
}


