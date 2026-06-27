const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /partner-inquiries
 * @desc    Submit a new partner inquiry (Public)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { college_name, contact_person, phone, email, message } = req.body;

    if (!college_name || !contact_person || !phone || !email) {
      return res.status(400).json({ message: 'College name, contact person, phone, and email are required fields.' });
    }

    const { data, error } = await supabase
      .from('partner_inquiries')
      .insert([
        {
          college_name: college_name.trim(),
          contact_person: contact_person.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          message: message ? message.trim() : null
        }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating partner inquiry:', error);
    return res.status(500).json({ message: 'Server error creating partner inquiry', error: error.message });
  }
});

/**
 * @route   GET /partner-inquiries
 * @desc    Get all partner inquiries (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('partner_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error fetching partner inquiries:', error);
    return res.status(500).json({ message: 'Server error fetching partner inquiries', error: error.message });
  }
});

module.exports = router;
