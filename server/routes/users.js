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

module.exports = router;
