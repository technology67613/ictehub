const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /fee-records
 * @desc    Record a new fee payment (Admin only)
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const {
      application_id,
      student_name,
      phone,
      amount,
      fee_type,
      payment_mode,
      payment_date,
      transaction_ref,
      receipt_number,
      remarks
    } = req.body;

    if (!student_name || !amount || !payment_mode) {
      return res.status(400).json({ message: 'Student name, amount, and payment mode are required.' });
    }

    const autoReceipt = receipt_number || `BCN-REC-${Date.now().toString().slice(-6)}`;

    const newRecord = {
      application_id: application_id || null,
      student_name,
      phone: phone || null,
      amount: parseFloat(amount),
      fee_type: fee_type || 'Tuition Fee',
      payment_mode,
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      transaction_ref: transaction_ref || null,
      receipt_number: autoReceipt,
      recorded_by: req.user ? req.user.name || req.user.email : 'Admin',
      remarks: remarks || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('fee_records')
      .insert([newRecord])
      .select('*');

    if (error) throw error;

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating fee record:', error);
    return res.status(500).json({ message: 'Server error creating fee record', error: error.message });
  }
});

/**
 * @route   GET /fee-records
 * @desc    Get all fee records (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { search, fee_type, payment_mode } = req.query;

    let query = supabase
      .from('fee_records')
      .select('*')
      .order('payment_date', { ascending: false });

    if (fee_type && fee_type !== 'All') {
      query = query.eq('fee_type', fee_type);
    }

    if (payment_mode && payment_mode !== 'All') {
      query = query.eq('payment_mode', payment_mode);
    }

    const { data, error } = await query;

    if (error) throw error;

    let results = data || [];
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      results = results.filter(r =>
        (r.student_name || '').toLowerCase().includes(s) ||
        (r.phone || '').includes(s) ||
        (r.receipt_number || '').toLowerCase().includes(s) ||
        (r.transaction_ref || '').toLowerCase().includes(s)
      );
    }

    return res.json(results);
  } catch (error) {
    console.error('Error fetching fee records:', error);
    return res.status(500).json({ message: 'Server error fetching fee records', error: error.message });
  }
});

/**
 * @route   GET /fee-records/application/:applicationId
 * @desc    Get fee records for a specific application
 * @access  Private (Admin, assigned Telecaller, or Student)
 */
router.get('/application/:applicationId', protect, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { applicationId } = req.params;

    const { data, error } = await supabase
      .from('fee_records')
      .select('*')
      .eq('application_id', applicationId)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    return res.json(data || []);
  } catch (error) {
    console.error('Error fetching application fee records:', error);
    return res.status(500).json({ message: 'Server error fetching application fee records', error: error.message });
  }
});

/**
 * @route   PUT /fee-records/:id
 * @desc    Update fee record (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;
    const {
      student_name,
      phone,
      amount,
      fee_type,
      payment_mode,
      payment_date,
      transaction_ref,
      remarks
    } = req.body;

    const updateData = {};
    if (student_name) updateData.student_name = student_name;
    if (phone !== undefined) updateData.phone = phone;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (fee_type) updateData.fee_type = fee_type;
    if (payment_mode) updateData.payment_mode = payment_mode;
    if (payment_date) updateData.payment_date = payment_date;
    if (transaction_ref !== undefined) updateData.transaction_ref = transaction_ref;
    if (remarks !== undefined) updateData.remarks = remarks;

    const { data, error } = await supabase
      .from('fee_records')
      .update(updateData)
      .eq('id', id)
      .select('*');

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ message: 'Fee record not found.' });

    return res.json(data[0]);
  } catch (error) {
    console.error('Error updating fee record:', error);
    return res.status(500).json({ message: 'Server error updating fee record', error: error.message });
  }
});

/**
 * @route   DELETE /fee-records/:id
 * @desc    Delete fee record (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;

    const { error } = await supabase
      .from('fee_records')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee record:', error);
    return res.status(500).json({ message: 'Server error deleting fee record', error: error.message });
  }
});

module.exports = router;
