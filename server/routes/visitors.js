const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /visitors/track
 * @desc    Track visitor session, college views, and mode filters (Public)
 * @access  Public
 */
router.post('/track', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { session_id, college_id, college_name, mode_filter } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: 'session_id is required' });
    }

    // Check if session already exists
    const { data: visitor, error: findError } = await supabase
      .from('visitors')
      .select('*')
      .eq('session_id', session_id)
      .maybeSingle();

    if (findError) throw findError;

    const nowStr = new Date().toISOString();

    if (!visitor) {
      // Create new visitor session
      const viewed_colleges = [];
      if (college_id) {
        viewed_colleges.push({
          college_id,
          college_name: college_name || 'Unknown College',
          count: 1,
          last_viewed: nowStr
        });
      }

      const mode_filters_used = [];
      if (mode_filter) {
        mode_filters_used.push(mode_filter);
      }

      const { data: newVisitor, error: insertError } = await supabase
        .from('visitors')
        .insert([{
          session_id,
          viewed_colleges,
          mode_filters_used,
          first_seen_at: nowStr,
          last_seen_at: nowStr
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      return res.status(201).json(newVisitor);
    } else {
      // Update existing visitor session
      let viewed = visitor.viewed_colleges || [];
      if (college_id) {
        const existingIdx = viewed.findIndex(item => item.college_id === college_id);
        if (existingIdx > -1) {
          viewed[existingIdx].count = (viewed[existingIdx].count || 0) + 1;
          viewed[existingIdx].last_viewed = nowStr;
          if (college_name) {
            viewed[existingIdx].college_name = college_name;
          }
        } else {
          viewed.push({
            college_id,
            college_name: college_name || 'Unknown College',
            count: 1,
            last_viewed: nowStr
          });
        }
      }

      let modes = visitor.mode_filters_used || [];
      if (mode_filter && !modes.includes(mode_filter)) {
        modes = [...modes, mode_filter];
      }

      const { data: updatedVisitor, error: updateError } = await supabase
        .from('visitors')
        .update({
          viewed_colleges: viewed,
          mode_filters_used: modes,
          last_seen_at: nowStr
        })
        .eq('session_id', session_id)
        .select()
        .single();

      if (updateError) throw updateError;
      return res.json(updatedVisitor);
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return res.status(500).json({ message: 'Server error tracking visitor', error: error.message });
  }
});

/**
 * @route   PUT /visitors/link-lead
 * @desc    Link visitor session to a converted lead (Public)
 * @access  Public
 */
router.put('/link-lead', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { session_id, lead_id } = req.body;

    if (!session_id || !lead_id) {
      return res.status(400).json({ message: 'session_id and lead_id are required' });
    }

    const { data: updated, error } = await supabase
      .from('visitors')
      .update({ converted_to_lead_id: lead_id })
      .eq('session_id', session_id)
      .select();

    if (error) throw error;

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: 'Visitor session not found' });
    }

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error linking lead to visitor:', error);
    return res.status(500).json({ message: 'Server error linking lead', error: error.message });
  }
});

/**
 * @route   GET /visitors/hot-leads
 * @desc    Get unconverted visitor sessions sorted by total view count (Admin only)
 * @access  Private/Admin
 */
router.get('/hot-leads', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');

    const { data: sessions, error } = await supabase
      .from('visitors')
      .select('*')
      .is('converted_to_lead_id', null);

    if (error) throw error;

    const sortedSessions = (sessions || [])
      .map(session => {
        const totalViews = (session.viewed_colleges || []).reduce((sum, c) => sum + (c.count || 0), 0);
        return { ...session, total_views: totalViews };
      })
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, 20);

    return res.json(sortedSessions);
  } catch (error) {
    console.error('Error fetching hot leads:', error);
    return res.status(500).json({ message: 'Server error fetching hot leads', error: error.message });
  }
});

module.exports = router;
