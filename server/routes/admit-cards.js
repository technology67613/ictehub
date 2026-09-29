const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /admit-cards
 * @desc    Upload an admit card (Admin only)
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { student_user_id, application_id, academic_session, exam_name, exam_date, file_url, file_name } = req.body;

    if (!student_user_id || !exam_name || !file_url || !file_name) {
      return res.status(400).json({ message: 'student_user_id, exam_name, file_url, and file_name are required.' });
    }

    const admitCardRecord = {
      student_user_id,
      application_id: application_id || null,
      academic_session: academic_session || null,
      exam_name,
      exam_date: exam_date || null,
      file_url,
      file_name,
      uploaded_by: req.user.id
    };

    const { data, error } = await supabase
      .from('admit_cards')
      .insert([admitCardRecord])
      .select('*');

    if (error) {
      throw error;
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating admit card:', error);
    return res.status(500).json({ message: 'Server error creating admit card', error: error.message });
  }
});

/**
 * @route   GET /admit-cards
 * @desc    Get all admit cards (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { student_user_id } = req.query;

    let query = supabase
      .from('admit_cards')
      .select(`
        *,
        users!student_user_id (id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (student_user_id) {
      query = query.eq('student_user_id', student_user_id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return res.json(data);
  } catch (error) {
    console.error('Error fetching admit cards:', error);
    return res.status(500).json({ message: 'Server error fetching admit cards', error: error.message });
  }
});

/**
 * @route   GET /admit-cards/my
 * @desc    Get my admit cards (Student only)
 * @access  Private/Student
 */
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { data, error } = await supabase
      .from('admit_cards')
      .select('*')
      .eq('student_user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(data);
  } catch (error) {
    console.error('Error fetching student admit cards:', error);
    return res.status(500).json({ message: 'Server error fetching your admit cards', error: error.message });
  }
});

/**
 * @route   DELETE /admit-cards/:id
 * @desc    Delete an admit card (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;

    const { error } = await supabase
      .from('admit_cards')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.json({ message: 'Admit card deleted successfully' });
  } catch (error) {
    console.error('Error deleting admit card:', error);
    return res.status(500).json({ message: 'Server error deleting admit card', error: error.message });
  }
});

module.exports = router;
