const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /colleges
 * @desc    Get all colleges with optional mode filter
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { mode } = req.query;

    let query = supabase.from('colleges').select('*');

    if (mode) {
      if (!['Online', 'Offline'].includes(mode)) {
        return res.status(400).json({ message: 'Invalid mode filter. Must be Online or Offline.' });
      }
      query = query.eq('mode', mode);
    }

    const { data: colleges, error } = await query;

    if (error) {
      throw error;
    }

    return res.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return res.status(500).json({ message: 'Server error fetching colleges', error: error.message });
  }
});

/**
 * @route   POST /colleges
 * @desc    Create a new college
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const {
      name,
      logo_url,
      mode,
      location,
      courses_offered,
      commission_percent,
      commission_structure,
      contact_name,
      contact_phone,
      contact_email
    } = req.body;

    if (!name || !mode) {
      return res.status(400).json({ message: 'Name and mode are required fields.' });
    }

    if (!['Online', 'Offline'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode. Must be Online or Offline.' });
    }

    const { data: newCollege, error } = await supabase
      .from('colleges')
      .insert([
        {
          name,
          logo_url,
          mode,
          location: mode === 'Offline' ? location : null,
          courses_offered: courses_offered || [],
          commission_percent: commission_percent || 0,
          commission_structure,
          contact_name,
          contact_phone,
          contact_email
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json(newCollege[0]);
  } catch (error) {
    console.error('Error creating college:', error);
    return res.status(500).json({ message: 'Server error creating college', error: error.message });
  }
});

/**
 * @route   PUT /colleges/:id
 * @desc    Update a college
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;
    const {
      name,
      logo_url,
      mode,
      location,
      courses_offered,
      commission_percent,
      commission_structure,
      contact_name,
      contact_phone,
      contact_email
    } = req.body;

    // Check if college exists first
    const { data: existing, error: findError } = await supabase
      .from('colleges')
      .select('id, mode')
      .eq('id', id);

    if (findError) {
      throw findError;
    }

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'College not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (logo_url !== undefined) updateData.logo_url = logo_url || null;
    if (mode !== undefined) {
      if (!['Online', 'Offline'].includes(mode)) {
        return res.status(400).json({ message: 'Invalid mode. Must be Online or Offline.' });
      }
      updateData.mode = mode;
      if (mode === 'Online') {
        updateData.location = null;
      }
    }
    if (location !== undefined) {
      const currentMode = mode !== undefined ? mode : existing[0].mode;
      updateData.location = currentMode === 'Offline' ? location : null;
    }
    if (courses_offered !== undefined) updateData.courses_offered = courses_offered;
    if (commission_percent !== undefined) updateData.commission_percent = commission_percent;
    if (commission_structure !== undefined) updateData.commission_structure = commission_structure;
    if (contact_name !== undefined) updateData.contact_name = contact_name;
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone;
    if (contact_email !== undefined) updateData.contact_email = contact_email;

    const { data: updatedCollege, error } = await supabase
      .from('colleges')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return res.json(updatedCollege[0]);
  } catch (error) {
    console.error('Error updating college:', error);
    return res.status(500).json({ message: 'Server error updating college', error: error.message });
  }
});

/**
 * @route   DELETE /colleges/:id
 * @desc    Delete a college
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { id } = req.params;

    // Check if college exists first
    const { data: existing, error: findError } = await supabase
      .from('colleges')
      .select('id')
      .eq('id', id);

    if (findError) {
      throw findError;
    }

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'College not found' });
    }

    const { error } = await supabase
      .from('colleges')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('Error deleting college:', error);
    return res.status(500).json({ message: 'Server error deleting college', error: error.message });
  }
});

module.exports = router;
