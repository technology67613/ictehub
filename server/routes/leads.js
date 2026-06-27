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
 * @route   GET /leads/check
 * @desc    Check lead inquiry status by phone number (Public)
 * @access  Public
 */
router.get('/check', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    const cleanedPhone = phone.trim();

    // Fetch leads matching the phone number
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, status, interested_college_ids, created_at')
      .eq('phone', cleanedPhone)
      .order('created_at', { ascending: false });

    if (leadsError) throw leadsError;

    if (!leads || leads.length === 0) {
      return res.json([]);
    }

    // Resolve target college names
    const collegeIds = [...new Set(leads.flatMap(l => l.interested_college_ids || []))];
    let collegesMap = {};

    if (collegeIds.length > 0) {
      const { data: colleges, error: colError } = await supabase
        .from('colleges')
        .select('id, name')
        .in('id', collegeIds);

      if (!colError && colleges) {
        colleges.forEach(c => {
          collegesMap[c.id] = c.name;
        });
      }
    }

    const result = leads.map(l => ({
      id: l.id,
      name: l.name,
      status: l.status,
      interested_colleges: (l.interested_college_ids || []).map(id => collegesMap[id]).filter(Boolean),
      created_at: l.created_at
    }));

    return res.json(result);
  } catch (error) {
    console.error('Error checking lead status:', error);
    return res.status(500).json({ message: 'Server error checking status', error: error.message });
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
    const { status, assigned_telecaller_id, enrolled_institute_course_id } = req.body;

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

    if (enrolled_institute_course_id !== undefined) {
      updateData.enrolled_institute_course_id = enrolled_institute_course_id || null;
    }

    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select();

    if (updateError) {
      throw updateError;
    }

    // Automatic commission generation on enrolling in a college
    if (status === 'enrolled-college') {
      let enrolledCollegeId = req.body.enrolled_college_id;
      if (!enrolledCollegeId && lead.interested_college_ids && lead.interested_college_ids.length > 0) {
        enrolledCollegeId = lead.interested_college_ids[0];
      }

      if (enrolledCollegeId) {
        // Fetch college to make sure it exists
        const { data: college, error: colError } = await supabase
          .from('colleges')
          .select('id, name, commission_percent')
          .eq('id', enrolledCollegeId)
          .single();

        if (!colError && college) {
          // Check if commission record already exists for this lead and college
          const { data: existingComm } = await supabase
            .from('commissions')
            .select('id')
            .eq('lead_id', id)
            .eq('college_id', enrolledCollegeId);

          if (!existingComm || existingComm.length === 0) {
            await supabase
              .from('commissions')
              .insert([
                {
                  lead_id: id,
                  college_id: enrolledCollegeId,
                  amount: null, // to be updated later by admin
                  status: 'pending'
                }
              ]);
          }
        }
      }
    }

    return res.json(updatedLead[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    return res.status(500).json({ message: 'Server error updating lead', error: error.message });
  }
});

module.exports = router;
