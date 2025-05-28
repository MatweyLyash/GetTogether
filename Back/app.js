const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes');
const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');
const guestRouter = require('./routes/guestRouter');
const organizerRouter = require('./routes/organizerRoutes');
const { isAdmin, isOrganizer } = require('./middleware/roleMiddleware');
const auth = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware

app.use(cors({
    origin: 'http://192.168.1.14:5050', // Разрешить доступ с клиентского домена
    credentials: true
  }));

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/guest', guestRouter);

// User routes - requires authentication
app.use('/api/user', auth, userRouter);

// Organizer routes - requires organizer role
app.use('/api/organizer', auth, isOrganizer, organizerRouter);

// Admin routes - requires admin role
app.use('/api/admin', auth, isAdmin, adminRouter);

module.exports = app;