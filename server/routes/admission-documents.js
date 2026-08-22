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
