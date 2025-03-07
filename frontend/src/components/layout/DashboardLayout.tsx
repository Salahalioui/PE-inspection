import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
};

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userRole = user?.user_metadata?.role || 'unknown';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-6">
          <div className="bg-white shadow rounded-lg p-4">
            <nav className="space-y-2">
              {userRole === 'teacher' ? (
                <>
                  <NavLink to="/teacher/profile">Profile</NavLink>
                  <NavLink to="/teacher/schedule">Weekly Schedule</NavLink>
                  <NavLink to="/teacher/lessons">Lesson Plans</NavLink>
                  <NavLink to="/teacher/absences">Absences</NavLink>
                  <NavLink to="/teacher/progress">Progress Reports</NavLink>
                </>
              ) : userRole === 'inspector' ? (
                <>
                  <NavLink to="/inspector/teachers">Teachers Overview</NavLink>
                  <NavLink to="/inspector/visits">Field Visit Reports</NavLink>
                  <NavLink to="/inspector/visits/new">Submit Field Visit</NavLink>
                  <NavLink to="/inspector/reports">Analytics & Reports</NavLink>
                </>
              ) : null}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white shadow rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(to)}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
    >
      {children}
    </button>
  );
}
