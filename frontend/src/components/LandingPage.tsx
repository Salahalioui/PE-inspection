import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            PE Inspector Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline physical education teaching management and evaluation in Algeria
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 text-lg font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition duration-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 text-lg font-semibold rounded-lg border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition duration-300"
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">For Teachers</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Manage personal and professional information</li>
              <li>• Track weekly schedules</li>
              <li>• Create and monitor lesson plans</li>
              <li>• Record and manage absences</li>
            </ul>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">For Inspectors</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Review teacher profiles and progress</li>
              <li>• Submit field visit reports</li>
              <li>• Monitor teaching effectiveness</li>
              <li>• Access comprehensive analytics</li>
            </ul>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Bilingual support (Arabic & French)</li>
              <li>• Real-time progress tracking</li>
              <li>• Secure data management</li>
              <li>• Responsive design for all devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
