const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// POST /admission-documents - Public
router.post('/', async (req, res) => {
  try {
    const supabase = req.supabase || req.app.get('supabase');
    const { lead_id, document_type, document_name, file_url, file_size } = req.body;
    if (!lead_id || !document_type || !document_name || !file_url) {
      return res.status(400).json({ error: 'lead_id, document_type, document_name and file_url are required' });
    }
    const { data, error } = await supabase
      .from('admission_documents')
      .insert([{ lead_id, document_type, document_name, file_url, file_size }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admission-documents/my - Student only
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const supabase = req.supabase || req.app.get('supabase');
    
    // Find the lead associated with this student
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('student_user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (leadError || !lead) {
      return res.json([]);
    }

    const { data, error } = await supabase
      .from('admission_documents')
      .select('*')
      .eq('lead_id', lead.id)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching student documents:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /admission-documents/:leadId - Admin or assigned telecaller
router.get('/:leadId', protect, async (req, res) => {
  try {
    const supabase = req.supabase || req.app.get('supabase');
    const { leadId } = req.params;
    if (req.user.role !== 'admin') {
      const { data: lead } = await supabase
        .from('leads')
        .select('assigned_telecaller_id')
        .eq('id', leadId)
        .single();
      if (!lead || lead.assigned_telecaller_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    const { data, error } = await supabase
      .from('admission_documents')
      .select('*')
      .eq('lead_id', leadId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admission-documents/:id - Admin or assigned Telecaller
router.put('/:id', protect, async (req, res) => {
  try {
    const supabase = req.supabase || req.app.get('supabase');
    const { id } = req.params;
    const { verification_status, verification_note } = req.body;

    const { data: doc, error: docErr } = await supabase
      .from('admission_documents')
      .select('*, leads(*)')
      .eq('id', id)
      .single();

    if (docErr || !doc) {
      return res.status(404).json({ error: 'Admission document not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignedTelecaller = req.user.role === 'telecaller' && (
      doc.leads && doc.leads.assigned_telecaller_id === req.user.id
    );

    if (!isAdmin && !isAssignedTelecaller) {
      return res.status(403).json({ error: 'Not authorized to verify or update this document.' });
    }

    const updateData = {};
    if (verification_status) {
      const allowed = ['pending', 'verified', 'rejected'];
      if (!allowed.includes(verification_status)) {
        return res.status(400).json({ error: 'Invalid verification status value.' });
      }
      updateData.verification_status = verification_status;
    }
    if (verification_note !== undefined) updateData.verification_note = verification_note;

    const { data, error } = await supabase
      .from('admission_documents')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admission-documents/:id - Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.supabase || req.app.get('supabase');
    const { id } = req.params;
    const { error } = await supabase
      .from('admission_documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
