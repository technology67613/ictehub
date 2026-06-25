require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const { protect, authorize } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Hardcoded MONGODB_URI directly
const MONGODB_URI = 'mongodb+srv://ictehub_user:India%401947@cluster0.1c2pzq.mongodb.net/?retryWrites=true&w=majority&appName=cluster0';

console.log('Using MONGODB_URI:', MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);

// Test Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Protected Test Routes (for verification)
app.get('/auth/test-protected', protect, (req, res) => {
  res.status(200).json({
    message: 'You have accessed a protected route successfully!',
    user: req.user,
  });
});

app.get('/auth/test-admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    message: 'You have accessed an admin-only protected route successfully!',
    user: req.user,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
