/**
 * Helper utility to automatically assign a lead to the least-loaded active telecaller.
 * 
 * Workload Scoring System:
 * - 'new' = 1 point
 * - 'contacted' = 2 points
 * - 'interested' = 3 points
 * - all other statuses = 0 points
 * 
 * @param {object} supabase - Supabase client instance
 * @param {string} leadId - UUID of the lead
 * @param {boolean} isInstituteLead - True if this is an institute lead, false for standard lead
 */
async function autoAssignTelecaller(supabase, leadId, isInstituteLead = false) {
  try {
    // 1. Fetch all active telecallers
    const { data: telecallers, error: tcError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'telecaller')
      .eq('is_active', true);

    if (tcError) throw tcError;

    if (!telecallers || telecallers.length === 0) {
      console.log('Auto-assign: No active telecallers found.');
      return null;
    }

    const tcIds = telecallers.map(t => t.id);

    // 2. Fetch leads assigned to these telecallers to calculate workloads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('assigned_telecaller_id, status')
      .in('assigned_telecaller_id', tcIds);

    if (leadsError) throw leadsError;

    const { data: instLeads, error: instLeadsError } = await supabase
      .from('institute_leads')
      .select('assigned_telecaller_id, status')
      .in('assigned_telecaller_id', tcIds);

    // Handle case where institute_leads table doesn't exist yet or errors
    const safeInstLeads = (!instLeadsError && instLeads) ? instLeads : [];

    // 3. Calculate weighted workload scores
    const weights = {
      'new': 1,
      'contacted': 2,
      'interested': 3,
      'not-interested': 0,
      'enrolled-college': 0,
      'enrolled-institute': 0,
      'enrolled': 0
    };

    const scores = {};
    tcIds.forEach(id => {
      scores[id] = 0;
    });

    const processLeads = (list) => {
      list.forEach(lead => {
        const id = lead.assigned_telecaller_id;
        const status = lead.status;
        if (id && scores[id] !== undefined) {
          scores[id] += (weights[status] || 0);
        }
      });
    };

    processLeads(leads || []);
    processLeads(safeInstLeads);

    // 4. Find the telecaller(s) with the lowest score
    let minScore = Infinity;
    let candidates = [];

    tcIds.forEach(id => {
      const score = scores[id];
      if (score < minScore) {
        minScore = score;
        candidates = [id];
      } else if (score === minScore) {
        candidates.push(id);
      }
    });

    // 5. Select telecaller (pick randomly if tied)
    const selectedTelecallerId = candidates[Math.floor(Math.random() * candidates.length)];

    // 6. Update the lead's assigned telecaller and set auto_assigned to true
    const targetTable = isInstituteLead ? 'institute_leads' : 'leads';
    const { data: updated, error: updateError } = await supabase
      .from(targetTable)
      .update({
        assigned_telecaller_id: selectedTelecallerId,
        auto_assigned: true
      })
      .eq('id', leadId)
      .select();

    if (updateError) throw updateError;

    console.log(`Auto-assign: Assigned lead ${leadId} in ${targetTable} to telecaller ${selectedTelecallerId} (Score: ${minScore})`);
    return selectedTelecallerId;
  } catch (error) {
    console.error('Error in autoAssignTelecaller:', error);
    return null;
  }
}

module.exports = autoAssignTelecaller;
