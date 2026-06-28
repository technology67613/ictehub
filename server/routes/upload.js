const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');

// Setup multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

/**
 * @route   POST /upload
 * @desc    Upload file to Supabase storage (Any logged-in user)
 * @access  Private
 */
router.post('/', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size limit exceeded. Maximum file size is 2MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
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
