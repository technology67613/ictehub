const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /call-logs
 * @desc    Create a call log entry (Telecaller only, must own the lead)
 * @access  Private/Telecaller
 */
router.post('/', protect, authorize('telecaller'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { lead_id, outcome, notes } = req.body;

    if (!lead_id || !outcome) {
      return res.status(400).json({ message: 'Lead ID and outcome are required.' });
    }

    const allowedOutcomes = ['interested', 'not-interested', 'call-back-later', 'no-answer'];
    if (!allowedOutcomes.includes(outcome)) {
      return res.status(400).json({ message: 'Invalid outcome value.' });
    }

    // Verify telecaller owns/is assigned to the lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('assigned_telecaller_id')
      .eq('id', lead_id)
      .single();

    if (leadError || !leadData) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    if (leadData.assigned_telecaller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized. You are not assigned to this lead.' });
    }

    // Insert call log
    const { data: newLog, error: logError } = await supabase
      .from('call_logs')
      .insert([
        {
          lead_id,
          telecaller_id: req.user.id,
          outcome,
          notes: notes || '',
        }
      ])
      .select();

    if (logError) {
      throw logError;
    }

    return res.status(201).json(newLog[0]);
  } catch (error) {
    console.error('Error creating call log:', error);
    return res.status(500).json({ message: 'Server error creating call log', error: error.message });
  }
});

/**
 * @route   GET /call-logs/:leadId
 * @desc    Get call history for a lead (Admin or assigned telecaller)
 * @access  Private
 */
router.get('/:leadId', protect, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { leadId } = req.params;

    // Verify authorization: admin or the assigned telecaller
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('assigned_telecaller_id')
      .eq('id', leadId)
      .single();

    if (leadError || !leadData) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssigned = leadData.assigned_telecaller_id === req.user.id;

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to view call logs for this lead.' });
    }

    // Fetch call logs
    const { data: logs, error: logsError } = await supabase
      .from('call_logs')
      .select(`
        id,
        lead_id,
        telecaller_id,
        outcome,
        notes,
        call_date,
        telecaller:users(name)
      `)
      .eq('lead_id', leadId)
      .order('call_date', { ascending: false });

    if (logsError) {
      throw logsError;
    }

    return res.json(logs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return res.status(500).json({ message: 'Server error fetching call logs', error: error.message });
  }
});

module.exports = router;
