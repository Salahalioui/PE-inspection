import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        className="container relative mx-auto px-4 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            PE Inspector Platform
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Streamline physical education teaching management and evaluation in Algeria
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-6 mt-8"
            variants={itemVariants}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-10 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 backdrop-blur-sm"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Create Account
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
          >
            <h3 className="text-2xl font-semibold mb-6 text-white">For Teachers</h3>
            <ul className="text-blue-100 space-y-4">
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Manage personal and professional information</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Track weekly schedules</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Create and monitor lesson plans</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Record and manage absences</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
          >
            <h3 className="text-2xl font-semibold mb-6 text-white">For Inspectors</h3>
            <ul className="text-blue-100 space-y-4">
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Review teacher profiles and progress</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Submit field visit reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Monitor teaching effectiveness</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Access comprehensive analytics</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-indigo-500/20 transition-all duration-300"
          >
            <h3 className="text-2xl font-semibold mb-6 text-white">Key Features</h3>
            <ul className="text-blue-100 space-y-4">
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Bilingual support (Arabic & French)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Real-time progress tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Secure data management</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-300">•</span>
                <span>Responsive design for all devices</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
