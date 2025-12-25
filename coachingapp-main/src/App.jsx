import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCourses from './pages/admin/AdminCourses'
import CourseDetails from './pages/admin/CourseDetails'
import AdminPages from './pages/admin/AdminPages'
import StartLiveClass from './pages/admin/StartLiveClass'
import JoinLiveClass from './pages/admin/JoinLiveClass'
import AdminReports from './pages/admin/AdminReports'
import CoachDashboard from './pages/coach/CoachDashboard'
import CoachCourses from './pages/coach/CoachCourses'
import CoachClasses from './pages/coach/CoachClasses'
import CoachLiveClass from './pages/coach/CoachLiveClass'
import CoachAssignments from './pages/coach/CoachAssignments'
import CoachProfile from './pages/coach/CoachProfile'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentCourses from './pages/student/StudentCourses'
import StudentClasses from './pages/student/StudentClasses'
import StudentLiveClass from './pages/student/StudentLiveClass'
import StudentAssignments from './pages/student/StudentAssignments'
import StudentProfile from './pages/student/StudentProfile'
import PageViewer from './pages/PageViewer'
import { getAuthUser } from './utils/auth'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authUser = getAuthUser()
    setUser(authUser)
    setLoading(false)
  }, [])

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (loading) return <div>Loading...</div>
    if (!user) return <Navigate to="/login" replace />
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <Routes>
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pages"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/live-class/start"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StartLiveClass />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/live-class/join"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <JoinLiveClass />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReports />
          </ProtectedRoute>
        }
      />

      {/* Coach Routes */}
      <Route
        path="/coach"
        element={
          <ProtectedRoute allowedRoles={['coach']}>
            <CoachDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach/courses"
        element={
          <ProtectedRoute allowedRoles={['coach']}>
            <CoachCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach/classes"
        element={
          <ProtectedRoute allowedRoles={['coach']}>
            <CoachClasses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach/live-class"
        element={
          <ProtectedRoute allowedRoles={['coach']}>
            <CoachLiveClass />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach/assignments"
        element={
          <ProtectedRoute allowedRoles={['coach']}>
            <CoachAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach/profile"
        element={
          <ProtectedRoute allowedRoles={['coach']}>
            <CoachProfile />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/classes"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentClasses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/live-class"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLiveClass />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      {/* Page Viewer Route - Accessible by all authenticated users */}
      <Route
        path="/page/:pageId"
        element={
          <ProtectedRoute allowedRoles={['admin', 'coach', 'student']}>
            <PageViewer />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App


