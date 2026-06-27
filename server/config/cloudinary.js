import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dummy_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'dummy_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy_secret',
});

// Upload image buffer directly to Cloudinary
export const uploadToCloudinary = (buffer, folder = 'smart-attendance') => {
  return new Promise((resolve, reject) => {
    // If credentials are left as dummy placeholders, return a mock URL for local testing
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name'
    ) {
      console.warn('Cloudinary not configured. Simulating image upload with compressed base64...');
      
      let sharpPipeline = sharp(buffer);
      if (folder.includes('students') || folder.includes('unknown')) {
        // Square crop for faces
        sharpPipeline = sharpPipeline.resize(256, 256, { fit: 'cover' });
      } else {
        // High quality scale down for classroom scans
        sharpPipeline = sharpPipeline.resize(1280, 720, { fit: 'inside', withoutEnlargement: true });
      }

      sharpPipeline
        .jpeg({ quality: 75 })
        .toBuffer()
        .then((compressedBuffer) => {
          const base64Data = compressedBuffer.toString('base64');
          const dataUrl = `data:image/jpeg;base64,${base64Data}`;
          resolve(dataUrl);
        })
        .catch((err) => {
          console.error('Compression failed, falling back to original buffer:', err.message);
          const base64Data = buffer.toString('base64');
          const dataUrl = `data:image/jpeg;base64,${base64Data}`;
          resolve(dataUrl);
        });
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

export default cloudinary;
