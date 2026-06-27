const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /commissions
 * @desc    Get all commissions (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { data: commissions, error } = await supabase
      .from('commissions')
      .select(`
        id,
        lead_id,
        college_id,
        amount,
        status,
        created_at,
        lead:leads(name),
        college:colleges(name, commission_percent)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(commissions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return res.status(500).json({ message: 'Server error fetching commissions', error: error.message });
  }
});

/**
 * @route   PUT /commissions/:id
 * @desc    Update a commission's amount and/or status (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;
    const { amount, status } = req.body;

    const updateData = {};
    if (amount !== undefined) {
      updateData.amount = amount === '' ? null : Number(amount);
    }
    if (status !== undefined) {
      if (!['pending', 'received'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value. Must be pending or received.' });
      }
      updateData.status = status;
    }

    const { data: updated, error } = await supabase
      .from('commissions')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        lead_id,
        college_id,
        amount,
        status,
        created_at,
        lead:leads(name),
        college:colleges(name, commission_percent)
      `);

    if (error) {
      throw error;
    }

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: 'Commission record not found.' });
    }

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error updating commission:', error);
    return res.status(500).json({ message: 'Server error updating commission', error: error.message });
  }
});

module.exports = router;
