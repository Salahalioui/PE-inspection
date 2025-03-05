import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import './index.css';
import './App.css';

// Teacher Dashboard Components
import { DashboardLayout } from './components/layout/DashboardLayout';
import { TeacherProfile } from './components/teacher/TeacherProfile';
import { WeeklySchedule } from './components/teacher/WeeklySchedule';
import { LessonPlans } from './components/teacher/LessonPlans';
import { AbsenceTracker } from './components/teacher/AbsenceTracker';
import { ProgressReports } from './components/teacher/ProgressReports';

// Teacher Dashboard Pages
function TeacherDashboard() {
  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to your Teacher Dashboard</h2>
        <p className="text-gray-600 mb-6">Use the sidebar to navigate to different sections</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <DashboardCard 
            title="Profile" 
            description="Manage your personal and professional information" 
            link="/teacher/profile" 
          />
          <DashboardCard 
            title="Weekly Schedule" 
            description="Organize your weekly teaching schedule" 
            link="/teacher/schedule" 
          />
          <DashboardCard 
            title="Lesson Plans" 
            description="Create and track your lesson plans" 
            link="/teacher/lessons" 
          />
          <DashboardCard 
            title="Absences" 
            description="Record and manage your absences" 
            link="/teacher/absences" 
          />
          <DashboardCard 
            title="Progress Reports" 
            description="View your teaching progress and statistics" 
            link="/teacher/progress" 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function TeacherProfilePage() {
  return (
    <DashboardLayout title="Teacher Profile">
      <TeacherProfile />
    </DashboardLayout>
  );
}

function TeacherSchedulePage() {
  return (
    <DashboardLayout title="Weekly Schedule">
      <WeeklySchedule />
    </DashboardLayout>
  );
}

function TeacherLessonsPage() {
  return (
    <DashboardLayout title="Lesson Plans">
      <LessonPlans />
    </DashboardLayout>
  );
}

function TeacherAbsencesPage() {
  return (
    <DashboardLayout title="Absence Tracker">
      <AbsenceTracker />
    </DashboardLayout>
  );
}

function TeacherProgressPage() {
  return (
    <DashboardLayout title="Progress Reports">
      <ProgressReports />
    </DashboardLayout>
  );
}

// Inspector Dashboard Pages (placeholders for now)
function InspectorDashboard() {
  return (
    <DashboardLayout title="Inspector Dashboard">
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to your Inspector Dashboard</h2>
        <p className="text-gray-600">Inspector features coming soon</p>
      </div>
    </DashboardLayout>
  );
}

// Dashboard Card Component
function DashboardCard({ title, description, link }: { title: string; description: string; link: string }) {
  const navigate = useNavigate();
  
  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(link)}
    >
      <h3 className="text-lg font-semibold text-indigo-600 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Login() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">PE Inspector Platform</h1>
      <AuthForm type="login" />
      <p className="text-center mt-4">
        Don't have an account?{' '}
        <a href="/register" className="text-indigo-600 hover:text-indigo-800">
          Register here
        </a>
      </p>
    </div>
  );
}

function Register() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">PE Inspector Platform</h1>
      <AuthForm type="register" />
      <p className="text-center mt-4">
        Already have an account?{' '}
        <a href="/login" className="text-indigo-600 hover:text-indigo-800">
          Login here
        </a>
      </p>
    </div>
  );
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Role-based route component
function RoleRoute({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: 'teacher' | 'inspector' 
}) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  
  const userRole = user?.user_metadata?.role;
  
  if (!user || userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teacher" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="teacher">
                <TeacherDashboard />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/profile" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="teacher">
                <TeacherProfilePage />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/schedule" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="teacher">
                <TeacherSchedulePage />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/lessons" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="teacher">
                <TeacherLessonsPage />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/absences" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="teacher">
                <TeacherAbsencesPage />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/progress" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="teacher">
                <TeacherProgressPage />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path="/inspector" element={
            <ProtectedRoute>
              <RoleRoute allowedRole="inspector">
                <InspectorDashboard />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
