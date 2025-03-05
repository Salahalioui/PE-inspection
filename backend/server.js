const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Define routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PE Inspector Platform API' });
});

// Import route files
const teacherRoutes = require('./routes/teacher.routes');
const inspectorRoutes = require('./routes/inspector.routes');

// Use routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/inspectors', inspectorRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});