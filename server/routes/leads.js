const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /leads
 * @desc    Submit a new lead inquiry (Public)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { name, phone, email, interested_college_ids, session_id } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required fields.' });
    }

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          phone,
          email: email || null,
          interested_college_ids: interested_college_ids || [],
          session_id: session_id || null,
          status: 'new',
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json(newLead[0]);
  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({ message: 'Server error creating lead', error: error.message });
  }
});

/**
 * @route   GET /leads
 * @desc    Get all leads (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ message: 'Server error fetching leads', error: error.message });
  }
});

/**
 * @route   GET /leads/my
 * @desc    Get leads assigned to current telecaller (Telecaller only)
 * @access  Private/Telecaller
 */
router.get('/my', protect, authorize('telecaller'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('assigned_telecaller_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(leads);
  } catch (error) {
    console.error('Error fetching my leads:', error);
    return res.status(500).json({ message: 'Server error fetching leads', error: error.message });
  }
});

/**
 * @route   PUT /leads/:id
 * @desc    Update lead status or assign telecaller (Admin or Assigned Telecaller)
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;
    const { status, assigned_telecaller_id } = req.body;

    // Fetch the lead first to check authorization
    const { data: existing, error: findError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id);

    if (findError) {
      throw findError;
    }

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = existing[0];

    // Authorization check
    const isAdmin = req.user.role === 'admin';
    const isAssignedTelecaller = req.user.role === 'telecaller' && lead.assigned_telecaller_id === req.user.id;

    if (!isAdmin && !isAssignedTelecaller) {
      return res.status(403).json({
        message: 'You are not authorized to update this lead.',
      });
    }

    const updateData = {};
    if (status !== undefined) {
      const allowedStatus = ['new', 'contacted', 'interested', 'not-interested', 'enrolled-college', 'enrolled-institute'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      updateData.status = status;
    }

    if (assigned_telecaller_id !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only admins can assign telecallers to leads.' });
      }
      updateData.assigned_telecaller_id = assigned_telecaller_id || null;
    }

    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select();

    if (updateError) {
      throw updateError;
    }

    return res.json(updatedLead[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    return res.status(500).json({ message: 'Server error updating lead', error: error.message });
  }
});

module.exports = router;
