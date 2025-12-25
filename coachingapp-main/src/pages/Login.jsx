import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../utils/auth'
import './Login.css'

const Login = ({ setUser }) => {
  const [selectedRole, setSelectedRole] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedRole || !username || !password) {
      setError('Please fill in all fields')
      return
    }

    const result = await login(username, password, selectedRole)
    
    if (result.success) {
      setUser(result.user)
      if (result.user.role === 'admin') {
        navigate('/admin')
      } else if (result.user.role === 'coach') {
        navigate('/coach')
      } else if (result.user.role === 'student') {
        navigate('/student')
      }
    } else {
      setError(result.error || 'Invalid credentials')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
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
          <p className="brand-slogan">Transform Your Learning Journey</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Select User</label>
            <select
              id="role"
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-input"
              required
            >
              <option value="">Choose your role...</option>
              <option value="admin">👤 Admin</option>
              <option value="coach">👤 Coach</option>
              <option value="student">👤 Student</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="form-input"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Login →
          </button>
        </form>

        <div className="login-links">
          <Link to="/signup" className="login-link">Sign Up</Link>
          <span className="link-separator">•</span>
          <Link to="/reset-password" className="login-link">Reset Password</Link>
        </div>

        <div className="login-footer">
          <p>Secure • Reliable • Innovative</p>
        </div>
      </div>
    </div>
  )
}

export default Login


