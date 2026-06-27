const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /users
 * @desc    Get users by role (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { role } = req.query;

    let query = supabase.from('users').select('id, name, email, role, profile_picture_url, created_at').order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) {
      throw error;
    }

    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
});

/**
 * @route   POST /users
 * @desc    Create a new user (Admin only)
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    if (!['admin', 'telecaller'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or telecaller' });
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim());

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: name ? name.trim() : null,
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          role
        }
      ])
      .select('id, name, email, role, profile_picture_url, created_at');

    if (insertError) throw insertError;

    return res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user account:', error);
    return res.status(500).json({ message: 'Server error creating user account', error: error.message });
  }
});

/**
 * @route   PUT /users/me
 * @desc    Update current logged-in user details (Self)
 * @access  Private
 */
router.put('/me', protect, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { name, profile_picture_url } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (profile_picture_url !== undefined) updateData.profile_picture_url = profile_picture_url || null;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, name, email, role, profile_picture_url');

    if (error) {
      throw error;
    }

    return res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating current user profile:', error);
    return res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

module.exports = router;
