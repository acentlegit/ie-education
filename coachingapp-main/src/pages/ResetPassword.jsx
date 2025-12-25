import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPasswordWithToken, resetPasswordDirect } from '../utils/auth'
import './ResetPassword.css'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || new URLSearchParams(window.location.search).get('token')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const username = e.target.username?.value
    const newPassword = e.target.password.value
    const confirmPassword = e.target.confirmPassword?.value

    if (!username || !newPassword) {
      setError('Username and password are required')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      let result
      if (token) {
        // Use token-based reset
        result = await resetPasswordWithToken(token, username, newPassword)
      } else {
        // Use direct reset without token
        result = await resetPasswordDirect(username, newPassword)
      }

      if (result.success) {
        setSuccess('Password updated')
        e.target.reset()
      } else {
        setError(result.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="reset-container">
      <div className="reset-card">
        <div className="reset-header">
          <div className="logo-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4L8 12V24C8 32.84 13.16 40.68 20 43.28L24 45L28 43.28C34.84 40.68 40 32.84 40 24V12L24 4Z"
                fill="#6B46C1"
              />
              <path
                d="M24 20L16 24V28C16 32.42 19.58 36 24 36C28.42 36 32 32.42 32 28V24L24 20Z"
                fill="#F59E0B"
              />
            </svg>
          </div>
          <h1 className="brand-name">EduCoach</h1>
          <p className="brand-slogan">Reset password</p>
        </div>

        <form onSubmit={submit} className="reset-form">
          <div className="form-group">
            <input
              name="username"
              type="text"
              placeholder="Username"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              name="password"
              type="password"
              placeholder="New password"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="reset-button">
            Update
          </button>
        </form>

        <div className="reset-footer">
          <p>
            Remember your password? <Link to="/login" className="link">Login</Link>
          </p>
          <p>
            Don't have an account? <Link to="/signup" className="link">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

