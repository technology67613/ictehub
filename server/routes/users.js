const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { role } = req.query;

    let query = supabase.from('users').select('id, name, email, role, profile_picture_url, is_active, created_at').order('created_at', { ascending: false });

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
          role,
          is_active: true
        }
      ])
      .select('id, name, email, role, profile_picture_url, is_active, created_at');

    if (insertError) throw insertError;

    return res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user account:', error);
    return res.status(500).json({ message: 'Server error creating user account', error: error.message });
  }
});

/**
 * @route   PUT /users/:id/toggle-active
 * @desc    Toggle user active status (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/toggle-active', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;

    // Fetch existing user state
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', id)
      .single();

    if (findError || !user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    const nextState = !user.is_active;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ is_active: nextState })
      .eq('id', id)
      .select('id, name, email, role, profile_picture_url, is_active, created_at')
      .single();

    if (updateError) throw updateError;

    return res.json(updatedUser);
  } catch (error) {
    console.error('Error toggling user account status:', error);
    return res.status(500).json({ message: 'Server error toggling user account status', error: error.message });
  }
});

/**
 * @route   DELETE /users/:id
 * @desc    Delete user account (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;

    // Check user exists and get their role/active status
    const { data: user, error: checkError } = await supabase
      .from('users')
      .select('id, role, is_active')
      .eq('id', id)
      .single();

    if (checkError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safeguard: Check if this is the last remaining admin account
    if (user.role === 'admin' && user.is_active === true) {
      const { count, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true);

      if (countError) throw countError;

      if (count <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last remaining active admin account.' });
      }
    }

    // Delete user from Supabase. FKey constraint ON DELETE SET NULL on leads.assigned_telecaller_id
    // and ON DELETE SET NULL on call_logs.telecaller_id handles cascades correctly.
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return res.json({ message: 'User account successfully deleted.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error deleting user', error: error.message });
  }
});

/**
 * @route   GET /users/:id/activity
 * @desc    Get user activity logs (Admin only)
 * @access  Private/Admin
 */
router.get('/:id/activity', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;

    // Fetch assigned leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, status, created_at')
      .eq('assigned_telecaller_id', id)
      .order('created_at', { ascending: false });

    if (leadsError) throw leadsError;

    // Fetch assigned institute leads
    const { data: instLeads, error: instLeadsError } = await supabase
      .from('institute_leads')
      .select('id, name, status, created_at')
      .eq('assigned_telecaller_id', id)
      .order('created_at', { ascending: false });

    const safeInstLeads = instLeads || [];

    // Combine and sort leads
    const combinedLeads = [
      ...(leads || []).map(l => ({ ...l, type: 'college' })),
      ...safeInstLeads.map(l => ({ ...l, type: 'institute' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Fetch call history logs
    const { data: callLogs, error: logsError } = await supabase
      .from('call_logs')
      .select('id, outcome, notes, call_date, leads(name)')
      .eq('telecaller_id', id)
      .order('call_date', { ascending: false });

    if (logsError) throw logsError;

    return res.json({
      leads: combinedLeads,
      callLogs: (callLogs || []).map(log => ({
        id: log.id,
        outcome: log.outcome,
        notes: log.notes,
        call_date: log.call_date,
        lead_name: log.leads ? log.leads.name : 'Unknown Student'
      }))
    });
  } catch (error) {
    console.error('Error fetching user activity details:', error);
    return res.status(500).json({ message: 'Server error fetching activity details', error: error.message });
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
      .select('id, name, email, role, profile_picture_url, is_active, created_at');

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
