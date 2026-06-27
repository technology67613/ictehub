const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /institute-courses
 * @desc    Get all institute courses (Public)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: courses, error } = await supabase
      .from('institute_courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(courses);
  } catch (error) {
    console.error('Error fetching institute courses:', error);
    return res.status(500).json({ message: 'Server error fetching institute courses', error: error.message });
  }
});

/**
 * @route   POST /institute-courses
 * @desc    Create a new institute course (Admin only)
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { name, duration, fees } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Course name is required.' });
    }

    const { data: newCourse, error } = await supabase
      .from('institute_courses')
      .insert([
        {
          name,
          duration: duration || '2 years',
          fees: fees !== undefined && fees !== '' ? Number(fees) : null
        }
      ])
      .select();

    if (error) throw error;
    return res.status(201).json(newCourse[0]);
  } catch (error) {
    console.error('Error creating institute course:', error);
    return res.status(500).json({ message: 'Server error creating institute course', error: error.message });
  }
});

/**
 * @route   PUT /institute-courses/:id
 * @desc    Update an institute course (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;
    const { name, duration, fees } = req.body;

    // Check if course exists first
    const { data: existing, error: findError } = await supabase
      .from('institute_courses')
      .select('id')
      .eq('id', id);

    if (findError) throw findError;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (duration !== undefined) updateData.duration = duration;
    if (fees !== undefined) updateData.fees = fees === '' ? null : Number(fees);

    const { data: updatedCourse, error } = await supabase
      .from('institute_courses')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return res.json(updatedCourse[0]);
  } catch (error) {
    console.error('Error updating institute course:', error);
    return res.status(500).json({ message: 'Server error updating institute course', error: error.message });
  }
});

/**
 * @route   DELETE /institute-courses/:id
 * @desc    Delete an institute course (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;

    // Check if course exists first
    const { data: existing, error: findError } = await supabase
      .from('institute_courses')
      .select('id')
      .eq('id', id);

    if (findError) throw findError;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { error } = await supabase
      .from('institute_courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting institute course:', error);
    return res.status(500).json({ message: 'Server error deleting institute course', error: error.message });
  }
});

module.exports = router;
