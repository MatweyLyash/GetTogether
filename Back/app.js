const express = require('express');
const models = require('./models/relations');
const authRouter = require('./routes/authRoutes');
const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');
const organizerRouter = require('./routes/organizerRoutes');
const { isAdmin, isOrganizer } = require('./middleware/roleMiddleware');
const auth = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);

// User routes - requires authentication
app.use('/api/user', auth, userRouter);

// Organizer routes - requires organizer role
app.use('/api/organizer', auth, isOrganizer, organizerRouter);

// Admin routes - requires admin role
app.use('/api/admin', auth, isAdmin, adminRouter);

module.exports = app;