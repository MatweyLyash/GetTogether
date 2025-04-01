// app.js
const express = require('express');
const models = require('./models/relations');
const authRouter = require('./routes/authRoutes');
const adminRouter = require('./routes/adminRoutes')

const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);




module.exports = app;