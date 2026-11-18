import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure in-memory storage for GCS stream / local fallback
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for high-res leaf scans
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP image files are permitted.'));
    }
  }
});

// Initialize Google Cloud Storage if credentials/project are configured
let gcsStorage = null;
let gcsBucket = null;

try {
  if (process.env.GCP_PROJECT_ID && process.env.GCS_BUCKET_NAME) {
    gcsStorage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
    });
    gcsBucket = gcsStorage.bucket(process.env.GCS_BUCKET_NAME);
  }
} catch (err) {
  console.warn('[Storage] GCS initialization failed, defaulting to local storage fallback:', err.message);
}

/**
 * Upload file buffer to Google Cloud Storage or save to local disk
 * @param {Express.Multer.File} file 
 * @param {string} folderPrefix 
 * @returns {Promise<string>} Public or accessible URL
 */
export const saveUploadedFile = async (file, folderPrefix = 'scans') => {
  if (!file) return null;

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${folderPrefix}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  // Try GCS first if bucket is configured
  if (gcsBucket) {
    try {
      const gcsFile = gcsBucket.file(filename);
      await gcsFile.save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
      });
      return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;
    } catch (gcsError) {
      console.warn('[Storage] GCS upload error, saving locally instead:', gcsError.message);
    }
  }

  // Local fallback
  const localFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const localFilePath = path.join(uploadDir, localFileName);
  await fs.promises.writeFile(localFilePath, file.buffer);
  
  // Return relative/hosted URL
  return `/uploads/${localFileName}`;
};
