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

// Stripe webhook must receive raw body — before express.json()
const PromotionController = require('./controllers/promotionController');
app.post('/api/guest/stripe-webhook', express.raw({ type: 'application/json' }), PromotionController.webhook);

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: true,
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

// Global error handler — catches MulterErrors and file filter errors
app.use((err, _req, res, _next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Файл слишком большой. Максимальный размер — 5 МБ' });
    }
    return res.status(400).json({ error: 'Ошибка загрузки файла: ' + err.message });
  }
  if (err.message && err.message.includes('Допустимы только изображения')) {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

module.exports = app;