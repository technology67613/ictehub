const verifyRecaptcha = async (token) => {
  if (!token) return false;
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not defined in environment variables.');
      return false;
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();
    return !!(data.success && data.score > 0.5);
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return false;
  }
};

module.exports = verifyRecaptcha;
