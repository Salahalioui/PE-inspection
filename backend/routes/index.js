const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const teacherRoutes = require('./teacher.routes');
const inspectorRoutes = require('./inspector.routes');

// Define routes
router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/inspectors', inspectorRoutes);

module.exports = router;