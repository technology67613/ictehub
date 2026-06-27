const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @route   POST /auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { name, email, password } = req.body;
    const role = 'telecaller'; // Force telecaller role for public signups

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase());

    if (checkError) {
      throw checkError;
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: email.toLowerCase(),
          password_hash: passwordHash,
          role,
        },
      ])
      .select();

    if (insertError) {
      throw insertError;
    }

    const user = newUser[0];

    return res.status(201).json({
      token: generateToken(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

/**
 * @route   POST /auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email in Supabase
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase());

    if (findError) {
      throw findError;
    }

    const user = users && users[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.is_active === false) {
      return res.status(403).json({ message: 'Your account has been paused. Contact admin.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      token: generateToken(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

module.exports = router;
