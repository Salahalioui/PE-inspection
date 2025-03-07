import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import { DashboardLayout } from './components/layout/DashboardLayout';

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

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route path="/login" element={<AuthForm type="login" />} />
        
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
          <Route path="visits" element={<FieldVisitList />} />
          <Route path="visits/new" element={<FieldVisit />} />
          <Route path="reports" element={<Reports />} />
          <Route index element={<Navigate to="teachers" replace />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
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
