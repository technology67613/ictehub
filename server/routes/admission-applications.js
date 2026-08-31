const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /admission-applications
 * @desc    Submit a new relational admission application with qualifications (Public)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const {
      lead_id,
      student_user_id,
      program_type,
      course,
      specialization,
      preferred_college_type,
      academic_session,
      category,
      full_name,
      father_name,
      mother_name,
      dob,
      gender,
      nationality,
      blood_group,
      aadhaar_number,
      photo_url,
      primary_mobile,
      alternate_mobile,
      email,
      perm_address_line1,
      perm_address_line2,
      perm_city,
      perm_district,
      perm_state,
      perm_pin,
      corr_same_as_perm,
      corr_address_line1,
      corr_address_line2,
      corr_city,
      corr_district,
      corr_state,
      corr_pin,
      guardian_name,
      guardian_relationship,
      guardian_mobile,
      hostel_required,
      hostel_location,
      scholarship_required,
      heard_about_us,
      source,
      qualifications,
      application_type,
      offline_form_url,
      marital_status,
      identification_mark,
      father_contact,
      payment_option,
      payment_amount,
      dd_number,
      dd_date,
      bank_name
    } = req.body;

    if (!full_name || !primary_mobile) {
      return res.status(400).json({ message: 'Full name and primary mobile are required.' });
    }

    // Resolve student_user_id if not explicitly provided
    let resolvedStudentUserId = student_user_id || null;
    if (!resolvedStudentUserId && lead_id) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('student_user_id')
        .eq('id', lead_id)
        .single();

      if (leadData && leadData.student_user_id) {
        resolvedStudentUserId = leadData.student_user_id;
      }
    }

    // 1. Insert into admission_applications
    const appRecord = {
      lead_id: lead_id || null,
      student_user_id: resolvedStudentUserId,
      program_type: program_type || null,
      course: course || null,
      specialization: specialization || null,
      preferred_college_type: preferred_college_type || null,
      academic_session: academic_session || '2025-26',
      category: category || 'General',
      full_name,
      father_name: father_name || null,
      mother_name: mother_name || null,
      dob: dob || null,
      gender: gender || 'Male',
      nationality: nationality || 'Indian',
      blood_group: blood_group || null,
      aadhaar_number: aadhaar_number || null,
      photo_url: photo_url || null,
      primary_mobile,
      alternate_mobile: alternate_mobile || null,
      email: email || null,
      perm_address_line1: perm_address_line1 || null,
      perm_address_line2: perm_address_line2 || null,
      perm_city: perm_city || null,
      perm_district: perm_district || null,
      perm_state: perm_state || null,
      perm_pin: perm_pin || null,
      corr_same_as_perm: corr_same_as_perm !== false,
      corr_address_line1: corr_address_line1 || null,
      corr_address_line2: corr_address_line2 || null,
      corr_city: corr_city || null,
      corr_district: corr_district || null,
      corr_state: corr_state || null,
      corr_pin: corr_pin || null,
      guardian_name: guardian_name || null,
      guardian_relationship: guardian_relationship || null,
      guardian_mobile: guardian_mobile || null,
      hostel_required: Boolean(hostel_required),
      hostel_location: hostel_location || null,
      scholarship_required: Boolean(scholarship_required),
      heard_about_us: heard_about_us || null,
      status: 'submitted',
      source: source || 'direct',
      application_type: application_type || 'online',
      offline_form_url: offline_form_url || null,
      marital_status: marital_status || null,
      identification_mark: identification_mark || null,
      father_contact: father_contact || null,
      payment_option: payment_option || null,
      payment_amount: payment_amount || null,
      dd_number: dd_number || null,
      dd_date: dd_date || null,
      bank_name: bank_name || null,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertedApps, error: insertError } = await supabase
      .from('admission_applications')
      .insert([appRecord])
      .select('*');

    if (insertError) {
      throw insertError;
    }

    const createdApp = insertedApps[0];

    // 2. Insert qualifications if provided
    let insertedQualifications = [];
    if (Array.isArray(qualifications) && qualifications.length > 0) {
      const qualsToInsert = qualifications.map((q, index) => ({
        application_id: createdApp.id,
        examination: q.examination || q.level || '',
        board_institution: q.board_institution || q.institution || q.board || '',
        year_of_passing: String(q.year_of_passing || q.year || ''),
        stream_subjects: q.stream_subjects || q.stream || '',
        percentage_cgpa: String(q.percentage_cgpa || q.percentage || ''),
        division: q.division || '',
        sort_order: q.sort_order !== undefined ? q.sort_order : index
      }));

      const { data: qualData, error: qualError } = await supabase
        .from('admission_qualifications')
        .insert(qualsToInsert)
        .select('*');

      if (!qualError && qualData) {
        insertedQualifications = qualData;
      }
    }

    return res.status(201).json({
      ...createdApp,
      qualifications: insertedQualifications,
      application_ref: createdApp.application_ref || `BCN-${createdApp.id.substring(0, 8).toUpperCase()}`
    });

  } catch (error) {
    console.error('Error creating admission application:', error);
    return res.status(500).json({ message: 'Server error creating admission application', error: error.message });
  }
});

/**
 * @route   GET /admission-applications
 * @desc    Get all admission applications (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { status, course, search } = req.query;

    let query = supabase
      .from('admission_applications')
      .select(`
        *,
        admission_qualifications (*),
        leads (
          id,
          assigned_telecaller_id,
          status,
          created_at
        )
      `)
      .order('submitted_at', { ascending: false });

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    if (course && course !== 'All') {
      query = query.ilike('course', `%${course}%`);
    }

    const { data: applications, error } = await query;

    if (error) {
      throw error;
    }

    // Optional text search filter
    let results = applications || [];
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      results = results.filter(app =>
        (app.full_name || '').toLowerCase().includes(s) ||
        (app.primary_mobile || '').includes(s) ||
        (app.email || '').toLowerCase().includes(s) ||
        (app.course || '').toLowerCase().includes(s) ||
        (app.application_ref || '').toLowerCase().includes(s) ||
        (app.id || '').toLowerCase().includes(s)
      );
    }

    return res.json(results);
  } catch (error) {
    console.error('Error fetching admission applications:', error);
    return res.status(500).json({ message: 'Server error fetching admission applications', error: error.message });
  }
});

/**
 * @route   GET /admission-applications/my
 * @desc    Get current student's own admission application with qualifications (Student only)
 * @access  Private/Student
 */
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');

    // 1. Try finding application directly via student_user_id
    let { data: apps, error: appError } = await supabase
      .from('admission_applications')
      .select(`
        *,
        admission_qualifications (*)
      `)
      .eq('student_user_id', req.user.id)
      .order('submitted_at', { ascending: false });

    if (appError) {
      throw appError;
    }

    // 2. Fallback: Check if student has a linked lead, and find application by lead_id
    if (!apps || apps.length === 0) {
      const { data: leads } = await supabase
        .from('leads')
        .select('id')
        .eq('student_user_id', req.user.id);

      if (leads && leads.length > 0) {
        const leadIds = leads.map(l => l.id);
        const { data: leadApps } = await supabase
          .from('admission_applications')
          .select(`
            *,
            admission_qualifications (*)
          `)
          .in('lead_id', leadIds)
          .order('submitted_at', { ascending: false });

        if (leadApps && leadApps.length > 0) {
          apps = leadApps;
        }
      }
    }

    // 3. Fallback by phone/email if still empty
    if (!apps || apps.length === 0) {
      const userPhone = req.user.phone || (req.user.email ? req.user.email.split('@')[0] : '');
      if (userPhone && /^\d{10}$/.test(userPhone)) {
        const { data: phoneApps } = await supabase
          .from('admission_applications')
          .select(`
            *,
            admission_qualifications (*)
          `)
          .eq('primary_mobile', userPhone)
          .order('submitted_at', { ascending: false });

        if (phoneApps && phoneApps.length > 0) {
          apps = phoneApps;
        }
      }
    }

    if (!apps || apps.length === 0) {
      return res.status(404).json({ message: 'No admission application found for your student account.' });
    }

    const application = apps[0];

    // Ensure qualifications are sorted
    if (Array.isArray(application.admission_qualifications)) {
      application.qualifications = application.admission_qualifications.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } else {
      application.qualifications = [];
    }

    // Ensure application_ref is populated
    if (!application.application_ref && application.id) {
      application.application_ref = `BCN-${application.id.substring(0, 8).toUpperCase()}`;
    }

    return res.json(application);
  } catch (error) {
    console.error('Error fetching student application:', error);
    return res.status(500).json({ message: 'Server error fetching student application', error: error.message });
  }
});

/**
 * @route   GET /admission-applications/:id
 * @desc    Get detailed admission application by ID (Admin or owner student)
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;

    const { data: apps, error } = await supabase
      .from('admission_applications')
      .select(`
        *,
        admission_qualifications (*),
        leads (*)
      `)
      .eq('id', id);

    if (error) {
      throw error;
    }

    if (!apps || apps.length === 0) {
      return res.status(404).json({ message: 'Admission application not found.' });
    }

    const application = apps[0];

    // Authorization check: Admins can view any, students can only view their own
    const isAdmin = req.user.role === 'admin' || req.user.role === 'telecaller';
    const isOwner = req.user.role === 'student' && (
      application.student_user_id === req.user.id ||
      (application.leads && application.leads.student_user_id === req.user.id)
    );

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this application.' });
    }

    if (Array.isArray(application.admission_qualifications)) {
      application.qualifications = application.admission_qualifications.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } else {
      application.qualifications = [];
    }

    return res.json(application);
  } catch (error) {
    console.error('Error fetching application details:', error);
    return res.status(500).json({ message: 'Server error fetching application details', error: error.message });
  }
});

/**
 * @route   GET /admission-applications/qualifications/:applicationId
 * @desc    Get qualifications for an application
 * @access  Private
 */
router.get('/qualifications/:applicationId', protect, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { applicationId } = req.params;

    const { data: quals, error } = await supabase
      .from('admission_qualifications')
      .select('*')
      .eq('application_id', applicationId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return res.json(quals || []);
  } catch (error) {
    console.error('Error fetching admission qualifications:', error);
    return res.status(500).json({ message: 'Server error fetching qualifications', error: error.message });
  }
});

/**
 * @route   PUT /admission-applications/:id
 * @desc    Update admission application status or details (Admin/Telecaller)
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;
    const { status, application_status, batch, roll_number, program_type, course, academic_session } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (application_status) updateData.application_status = application_status;
    if (batch !== undefined) updateData.batch = batch;
    if (roll_number !== undefined) updateData.roll_number = roll_number;
    if (program_type) updateData.program_type = program_type;
    if (course) updateData.course = course;
    if (academic_session) updateData.academic_session = academic_session;

    const { data: updatedApps, error } = await supabase
      .from('admission_applications')
      .update(updateData)
      .eq('id', id)
      .select('*');

    if (error) {
      throw error;
    }

    if (!updatedApps || updatedApps.length === 0) {
      return res.status(404).json({ message: 'Admission application not found.' });
    }

    return res.json(updatedApps[0]);
  } catch (error) {
    console.error('Error updating admission application:', error);
    return res.status(500).json({ message: 'Server error updating admission application', error: error.message });
  }
});

module.exports = router;
