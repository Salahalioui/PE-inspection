import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import { DashboardLayout } from './components/layout/DashboardLayout';
import LandingPage from './components/LandingPage';

// Teacher Components
import { TeacherProfile } from './components/teacher/TeacherProfile';
import { WeeklySchedule } from './components/teacher/WeeklySchedule';
import { LessonPlans } from './components/teacher/LessonPlans';
import { AbsenceTracker } from './components/teacher/AbsenceTracker';
import { ProgressReports } from './components/teacher/ProgressReports';

// Inspector Components
import { TeacherList } from './components/inspector/TeacherList';
import { TeacherDetails } from './components/inspector/TeacherDetails';
import { FieldVisit } from './components/inspector/FieldVisit';
import { FieldVisitList } from './components/inspector/FieldVisitList';
import { Reports } from './components/inspector/Reports';
import { TeacherSchedule } from './components/inspector/TeacherSchedule';

function MainRouter() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to={`/${user.user_metadata?.role}`} replace />} />
      <Route path="/login" element={!user ? <AuthForm type="login" /> : <Navigate to={`/${user.user_metadata?.role}`} replace />} />
      <Route path="/register" element={!user ? <AuthForm type="register" /> : <Navigate to={`/${user.user_metadata?.role}`} replace />} />
      {/* Protected Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <DashboardLayout title="Teacher Dashboard">
              <Outlet />
            </DashboardLayout>
          </ProtectedRoute>
        }
      >
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="schedule" element={<WeeklySchedule />} />
        <Route path="lessons" element={<LessonPlans />} />
        <Route path="absences" element={<AbsenceTracker />} />
        <Route path="progress" element={<ProgressReports />} />
        <Route index element={<Navigate to="profile" replace />} />
      </Route>

      {/* Protected Inspector Routes */}
      <Route
        path="/inspector"
        element={
          <ProtectedRoute role="inspector">
            <DashboardLayout title="Inspector Dashboard">
              <Outlet />
            </DashboardLayout>
          </ProtectedRoute>
        }
      >
        <Route path="teachers" element={<TeacherList />} />
            <Route path="teachers/:teacherId" element={<TeacherDetails />} />
            <Route path="teachers/:teacherId/schedule" element={<TeacherSchedule />} />
            <Route path="visits" element={<FieldVisitList />} />
        <Route path="visits/new" element={<FieldVisit />} />
        <Route path="reports" element={<Reports />} />
        <Route index element={<Navigate to="teachers" replace />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainRouter />
      </Router>
    </AuthProvider>
  );
}

// Protected Route Component
function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  
  if (!user || user.user_metadata?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default App;
