const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /reports/telecaller-performance
 * @desc    Get telecaller activity and conversion performance report (Admin only)
 * @access  Private/Admin
 */
router.get('/telecaller-performance', protect, authorize('admin'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { range = '7days', from, to } = req.query;

    let startDate = null;
    let endDate = new Date();

    const now = new Date();
    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7days') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === '30days') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else if (range === 'custom' && from) {
      startDate = new Date(from);
      if (to) endDate = new Date(to);
    }

    // 1. Fetch telecallers
    const { data: telecallers, error: userError } = await supabase
      .from('users')
      .select('id, name, email, is_active')
      .eq('role', 'telecaller');

    if (userError) throw userError;

    // 2. Fetch call logs within range
    let callQuery = supabase
      .from('call_logs')
      .select('id, telecaller_id, outcome, call_date');

    if (startDate) {
      callQuery = callQuery.gte('call_date', startDate.toISOString());
    }
    if (endDate) {
      callQuery = callQuery.lte('call_date', endDate.toISOString());
    }

    const { data: callLogs, error: callError } = await callQuery;
    if (callError) throw callError;

    // 3. Fetch leads assigned
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('id, assigned_telecaller_id, status, created_at');

    if (leadError) throw leadError;

    // 4. Map telecaller metrics
    const statsMap = {};
    (telecallers || []).forEach(t => {
      statsMap[t.id] = {
        id: t.id,
        name: t.name || t.email.split('@')[0],
        email: t.email,
        is_active: t.is_active,
        total_calls: 0,
        connected_calls: 0,
        interested_calls: 0,
        callback_calls: 0,
        no_answer_calls: 0,
        assigned_leads: 0,
        enrolled_leads: 0,
        conversion_rate: 0
      };
    });

    // Aggregate call logs
    (callLogs || []).forEach(c => {
      const tc = statsMap[c.telecaller_id];
      if (tc) {
        tc.total_calls += 1;
        if (c.outcome === 'interested') {
          tc.interested_calls += 1;
          tc.connected_calls += 1;
        } else if (c.outcome === 'call-back-later') {
          tc.callback_calls += 1;
          tc.connected_calls += 1;
        } else if (c.outcome === 'not-interested') {
          tc.connected_calls += 1;
        } else if (c.outcome === 'no-answer') {
          tc.no_answer_calls += 1;
        } else {
          tc.connected_calls += 1;
        }
      }
    });

    // Aggregate leads
    (leads || []).forEach(l => {
      if (l.assigned_telecaller_id && statsMap[l.assigned_telecaller_id]) {
        const tc = statsMap[l.assigned_telecaller_id];
        tc.assigned_leads += 1;
        if (l.status === 'enrolled-college' || l.status === 'enrolled-institute') {
          tc.enrolled_leads += 1;
        }
      }
    });

    const telecallerStats = Object.values(statsMap).map(tc => {
      const conversion_rate = tc.assigned_leads > 0 
        ? Math.round((tc.enrolled_leads / tc.assigned_leads) * 100) 
        : 0;
      return {
        ...tc,
        conversion_rate
      };
    });

    // Sort by enrolled leads descending, then total calls
    telecallerStats.sort((a, b) => b.enrolled_leads - a.enrolled_leads || b.total_calls - a.total_calls);

    // Identify top performer
    const topPerformer = telecallerStats.length > 0 && (telecallerStats[0].total_calls > 0 || telecallerStats[0].enrolled_leads > 0)
      ? telecallerStats[0]
      : null;

    // Calculate totals
    const totals = {
      total_calls: telecallerStats.reduce((sum, t) => sum + t.total_calls, 0),
      connected_calls: telecallerStats.reduce((sum, t) => sum + t.connected_calls, 0),
      interested_calls: telecallerStats.reduce((sum, t) => sum + t.interested_calls, 0),
      enrolled_leads: telecallerStats.reduce((sum, t) => sum + t.enrolled_leads, 0),
      total_telecallers: telecallers ? telecallers.length : 0
    };

    return res.json({
      range,
      from: startDate ? startDate.toISOString() : null,
      to: endDate ? endDate.toISOString() : null,
      totals,
      topPerformerId: topPerformer ? topPerformer.id : null,
      telecallers: telecallerStats
    });
  } catch (error) {
    console.error('Error generating telecaller report:', error);
    return res.status(500).json({ message: 'Server error generating telecaller report', error: error.message });
  }
});

module.exports = router;
