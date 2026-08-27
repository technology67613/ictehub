const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const autoAssignTelecaller = require('../utils/autoAssignTelecaller');

const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Helper to normalize date of birth into DDMMYYYY format string
 */
function formatDobToDDMMYYYY(dobStr) {
  if (!dobStr || typeof dobStr !== 'string') return null;
  const trimmed = dobStr.trim();

  // If already 8 continuous digits
  if (/^\d{8}$/.test(trimmed)) {
    return trimmed;
  }

  // Format YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}${month}${year}`;
  }

  // Format DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}${month}${year}`;
  }

  // Fallback date parsing
  const parsedDate = new Date(trimmed);
  if (!isNaN(parsedDate.getTime())) {
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = String(parsedDate.getFullYear());
    return `${day}${month}${year}`;
  }

  return null;
}

/**
 * @route   POST /leads
 * @desc    Submit a new lead inquiry & auto-create student account (Public)
 * @access  Public
 */
router.post('/', leadsLimiter, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { name, phone, email, interested_college_ids, session_id, source, admission_form_data } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required fields.' });
    }

    const cleanedPhone = phone.toString().trim().replace(/\D/g, '').slice(-10);
    const studentEmail = `${cleanedPhone}@student.ictehub`.toLowerCase();

    // Extract DOB if present in admission_form_data or req.body
    let rawDob = req.body.dob || null;
    if (!rawDob && admission_form_data) {
      if (typeof admission_form_data === 'object' && admission_form_data.dob) {
        rawDob = admission_form_data.dob;
      } else if (typeof admission_form_data === 'string') {
        try {
          const parsed = JSON.parse(admission_form_data);
          if (parsed && parsed.dob) {
            rawDob = parsed.dob;
          }
        } catch (e) {}
      }
    }

    const formattedDob = formatDobToDDMMYYYY(rawDob);
    const defaultPassword = formattedDob || cleanedPhone;

    // Check if a user with role='student' already exists with this phone/email
    let studentUserId = null;
    let studentCredentials = null;

    if (cleanedPhone.length === 10) {
      const { data: existingStudentUsers } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', studentEmail);

      if (existingStudentUsers && existingStudentUsers.length > 0) {
        studentUserId = existingStudentUsers[0].id;
      } else {
        // Create new student user with DOB as default password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(defaultPassword, salt);

        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([
            {
              name: name ? name.trim() : null,
              email: studentEmail,
              password_hash: passwordHash,
              role: 'student',
              is_active: true,
            }
          ])
          .select('id')
          .single();

        if (!userError && newUser) {
          studentUserId = newUser.id;
          studentCredentials = {
            phone: cleanedPhone,
            default_password: defaultPassword,
            email: studentEmail,
            message: 'Your login credentials',
          };
        }
      }
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
          source: source || 'direct',
          admission_form_data: admission_form_data || null,
          status: 'new',
          student_user_id: studentUserId || null,
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    // Auto assign telecaller
    await autoAssignTelecaller(supabase, newLead[0].id, false);

    // Fetch the lead again to return the updated record (with assigned_telecaller_id and auto_assigned fields populated)
    const { data: assignedLead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', newLead[0].id)
      .single();

    const responsePayload = assignedLead || newLead[0];
    if (studentCredentials) {
      responsePayload.student_credentials = studentCredentials;
    }

    return res.status(201).json(responsePayload);
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
    const { phone, name } = req.query;

    if (!phone || !name) {
      return res.status(400).json({ message: 'Phone number and name are required.' });
    }

    const cleanedPhone = phone.trim();
    const cleanedName = name.trim().toLowerCase();

    if (!/^\d{10}$/.test(cleanedPhone)) {
      return res.status(400).json({ message: 'Invalid phone number. Must be exactly 10 digits.' });
    }

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

    // Filter leads where name matches case-insensitively
    const matchedLeads = leads.filter(l => (l.name || '').trim().toLowerCase() === cleanedName);

    if (matchedLeads.length === 0) {
      return res.json([]);
    }

    // Resolve target college names
    const collegeIds = [...new Set(matchedLeads.flatMap(l => l.interested_college_ids || []))];
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

    const result = matchedLeads.map(l => ({
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
      updateData.auto_assigned = false;
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

/**
 * @route   GET /leads/my-application
 * @desc    Get linked lead/application for current student (Student only)
 * @access  Private/Student
 */
router.get('/my-application', protect, authorize('student'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');

    // Fetch the lead linked to this student
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('student_user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (leadError) {
      throw leadError;
    }

    if (!leads || leads.length === 0) {
      return res.status(404).json({ message: 'No application found linked to your student account.' });
    }

    const lead = leads[0];

    // Resolve interested colleges if any
    let resolvedColleges = [];
    if (lead.interested_college_ids && lead.interested_college_ids.length > 0) {
      const { data: colleges, error: colError } = await supabase
        .from('colleges')
        .select('id, name, city, state, courses, fee_range, brochure_url, website, logo_url')
        .in('id', lead.interested_college_ids);

      if (!colError && colleges) {
        resolvedColleges = colleges;
      }
    }

    // Resolve enrolled institute course if any
    let resolvedEnrolledCourse = null;
    if (lead.enrolled_institute_course_id) {
      const { data: courseData, error: courseError } = await supabase
        .from('institute_courses')
        .select('*')
        .eq('id', lead.enrolled_institute_course_id)
        .single();

      if (!courseError && courseData) {
        resolvedEnrolledCourse = courseData;
      }
    }

    // Parse admission_form_data if stored as a string
    let parsedFormData = lead.admission_form_data;
    if (typeof parsedFormData === 'string') {
      try {
        parsedFormData = JSON.parse(parsedFormData);
      } catch (e) {}
    }

    return res.json({
      ...lead,
      admission_form_data: parsedFormData,
      interested_colleges: resolvedColleges,
      enrolled_course: resolvedEnrolledCourse,
    });
  } catch (error) {
    console.error('Error fetching student application:', error);
    return res.status(500).json({ message: 'Server error fetching student application', error: error.message });
  }
});

module.exports = router;

