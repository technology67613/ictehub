const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');

// Setup multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * @route   POST /upload
 * @desc    Upload file to Supabase storage (Any logged-in user)
 * @access  Private
 */
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const file = req.file;
    const type = req.body.type || req.query.type;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!type) {
      return res.status(400).json({ message: 'Upload type (e.g. college-logo or profile-picture) is required' });
    }

    let bucketName = '';
    let folder = '';

    if (type === 'college-logo') {
      bucketName = 'college-logos';
      folder = 'logos';
    } else if (type === 'profile-picture') {
      bucketName = 'profile-pictures';
      folder = 'profiles';
    } else {
      return res.status(400).json({ message: 'Invalid upload type. Supported types: college-logo, profile-picture' });
    }

    // Generate a unique file name
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file buffer to Supabase Storage bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return res.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Error uploading file to Supabase Storage:', error);
    return res.status(500).json({ message: 'Server error uploading file', error: error.message });
  }
});

module.exports = router;
