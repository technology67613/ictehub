export function getFollowUpStatus(lead, lastCallLog) {
  if (!lead) return null;
  if (['enrolled-college', 'enrolled-institute', 'not-interested'].includes(lead.status)) {
    return null;
  }

  const now = Date.now();
  const contactDateStr = lastCallLog?.call_date || lead.updated_at || lead.created_at;
  const lastContactTime = contactDateStr ? new Date(contactDateStr).getTime() : now;
  const hoursSinceContact = (now - lastContactTime) / (1000 * 60 * 60);

  if (lead.status === 'new') {
    if (hoursSinceContact >= 24) {
      return { level: 'urgent', label: 'Overdue (24h+)', color: '#EF4444', bg: '#FEF2F2' };
    }
    return { level: 'soon', label: 'New Lead', color: '#3B82F6', bg: '#EFF6FF' };
  }

  if (hoursSinceContact >= 48) {
    return { level: 'urgent', label: 'Overdue (>48h)', color: '#EF4444', bg: '#FEF2F2' };
  }
  if (hoursSinceContact >= 24) {
    return { level: 'soon', label: 'Follow-up Due', color: '#F59E0B', bg: '#FFFBEB' };
  }

  return { level: 'recent', label: 'Contacted', color: '#10B981', bg: '#ECFDF5' };
}
