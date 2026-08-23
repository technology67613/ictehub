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
 * @route   GET /call-logs/my-timeline
 * @desc    Get student-friendly application timeline (Student only)
 * @access  Private/Student
 */
router.get('/my-timeline', protect, authorize('student'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');

    // Find the lead associated with this student
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, created_at, status')
      .eq('student_user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (leadError || !lead) {
      return res.json([]);
    }

    const { data: logs, error: logsError } = await supabase
      .from('call_logs')
      .select('id, call_date, outcome')
      .eq('lead_id', lead.id)
      .order('call_date', { ascending: false });

    if (logsError) throw logsError;

    const timelineEvents = [];

    // 1. Initial application submission event
    if (lead.created_at) {
      timelineEvents.push({
        id: `submit_${lead.id}`,
        title: 'Application Submitted',
        description: 'Your admission application was successfully received and registered in our portal.',
        date: lead.created_at,
        type: 'status',
      });
    }

    // 2. Counselor contact events (sanitized, student-friendly)
    (logs || []).forEach(l => {
      let description = 'Our admissions counseling team reached out to assist you with your application.';
      if (l.outcome === 'interested') {
        description = 'Counselor reviewed your eligibility and discussed program details.';
      } else if (l.outcome === 'call-back-later') {
        description = 'Follow-up scheduled with admissions counselor.';
      }

      timelineEvents.push({
        id: l.id,
        title: 'Admissions Team Follow-up',
        description,
        date: l.call_date,
        type: 'contact',
      });
    });

    // 3. Current status milestone if enrolled or shortlisted
    if (['interested', 'enrolled-college', 'enrolled-institute'].includes(lead.status)) {
      let statusTitle = 'Application Shortlisted';
      let statusDesc = 'Your profile is under priority review for admission.';
      if (lead.status === 'enrolled-college' || lead.status === 'enrolled-institute') {
        statusTitle = 'Admission Confirmed 🎉';
        statusDesc = 'Congratulations! You have been successfully admitted to Buddha College of Nursing.';
      }
      timelineEvents.push({
        id: `status_${lead.id}`,
        title: statusTitle,
        description: statusDesc,
        date: new Date().toISOString(),
        type: 'milestone',
      });
    }

    // Sort timeline descending by date
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json(timelineEvents);
  } catch (error) {
    console.error('Error fetching student timeline:', error);
    return res.status(500).json({ message: 'Server error fetching timeline', error: error.message });
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
