const API = 'https://ictehub.onrender.com';

export function getSessionId() {
  let id = localStorage.getItem('visitor_session_id');
  if (!id) {
    try {
      id = crypto.randomUUID();
    } catch (e) {
      // Fallback in case crypto.randomUUID is not available in some browsers/contexts
      id = 'f' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }
    localStorage.setItem('visitor_session_id', id);
  }
  return id;
}

export function getLeadSource() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlSource = params.get('source');
    if (urlSource) {
      localStorage.setItem('lead_source', urlSource.trim());
      return urlSource.trim();
    }
  } catch (e) {
    console.error('Error reading URL search params:', e);
  }
  
  let source = localStorage.getItem('lead_source');
  if (!source) {
    source = 'direct';
    localStorage.setItem('lead_source', source);
  }
  return source;
}

export function trackCollegeView(collegeId, collegeName) {
  const sessionId = getSessionId();
  fetch(`${API}/visitors/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      college_id: collegeId,
      college_name: collegeName
    })
  }).catch(err => {
    console.error('Silently caught tracking error:', err);
  });
}

export function trackModeFilter(mode) {
  const sessionId = getSessionId();
  fetch(`${API}/visitors/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      mode_filter: mode
    })
  }).catch(err => {
    console.error('Silently caught tracking error:', err);
  });
}

export function linkLeadToSession(leadId) {
  const sessionId = getSessionId();
  fetch(`${API}/visitors/link-lead`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      lead_id: leadId
    })
  }).catch(err => {
    console.error('Silently caught tracking link error:', err);
  });
}
