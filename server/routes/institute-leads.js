const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /institute-leads
 * @desc    Submit a new institute lead inquiry (Public)
 * @access  Public
 */
router.post('/', leadsLimiter, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { name, phone, email, interested_course_id, message, session_id } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required fields.' });
    }

    const { data: newLead, error } = await supabase
      .from('institute_leads')
      .insert([
        {
          name,
          phone,
          email: email || null,
          interested_course_id: interested_course_id || null,
          message: message || null,
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
    console.error('Error creating institute lead:', error);
    return res.status(500).json({ message: 'Server error creating institute lead', error: error.message });
  }
});

/**
 * @route   GET /institute-leads
 * @desc    Get all institute leads (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: leads, error } = await supabase
      .from('institute_leads')
      .select('*, institute_courses(name)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(leads);
  } catch (error) {
    console.error('Error fetching institute leads:', error);
    return res.status(500).json({ message: 'Server error fetching institute leads', error: error.message });
  }
});

/**
 * @route   PUT /institute-leads/:id
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
      .from('institute_leads')
      .select('*')
      .eq('id', id);

    if (findError) {
      throw findError;
    }

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Institute lead not found' });
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
      const allowedStatus = ['new', 'contacted', 'interested', 'not-interested', 'enrolled'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      updateData.status = status;
    }

    if (assigned_telecaller_id !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only admins can assign telecallers.' });
      }
      updateData.assigned_telecaller_id = assigned_telecaller_id || null;
    }

    const { data: updatedLead, error: updateError } = await supabase
      .from('institute_leads')
      .update(updateData)
      .eq('id', id)
      .select();

    if (updateError) {
      throw updateError;
    }

    return res.json(updatedLead[0]);
  } catch (error) {
    console.error('Error updating institute lead:', error);
    return res.status(500).json({ message: 'Server error updating lead', error: error.message });
  }
});

module.exports = router;
