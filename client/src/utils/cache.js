const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const getCached = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch { return null; }
};

export const setCached = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

export const clearCache = () => {
  ['colleges_cache', 'institute_courses_cache'].forEach(k => localStorage.removeItem(k));
};
