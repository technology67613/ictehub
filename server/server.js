require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const authRoutes = require('./routes/auth');
const collegesRoutes = require('./routes/colleges');
const leadsRoutes = require('./routes/leads');
const { protect, authorize } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Initializing Server with Supabase client...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded successfully' : 'Not found');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

app.set('supabase', supabase);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/colleges', collegesRoutes);
app.use('/leads', leadsRoutes);

// Test Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: 'supabase' });
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
