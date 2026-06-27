const express = require('express');
const router = express.Router();
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

    let query = supabase.from('users').select('id, name, email, role');

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
