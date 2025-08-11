import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  resource_type: string;
  format: string;
  bytes: number;
  duration?: number;
  width?: number;
  height?: number;
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'auto' | 'image' | 'video' | 'raw';
  quality?: string | number;
  format?: string;
  transformation?: any[];
}

/**
 * Upload a video file to Cloudinary
 * Supports both file paths and buffers
 */
export const uploadVideoToCloudinary = async (
  filePathOrBuffer: string | Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    const defaultOptions: CloudinaryUploadOptions = {
      resource_type: 'video',
      folder: 'screenforge/videos',
      quality: 'auto',
      ...options,
    };

    let result;

    if (Buffer.isBuffer(filePathOrBuffer)) {
        // Handle buffer upload (for serverless environments)
        // Convert buffer to base64 string for Cloudinary
        const base64Data = filePathOrBuffer.toString("base64");
        const dataURI = `data:video/mp4;base64,${base64Data}`;

        result = await cloudinary.uploader.upload(dataURI, defaultOptions);
    } else {
        // Handle file path upload (for local development)
        result = await cloudinary.uploader.upload(
            filePathOrBuffer,
            defaultOptions
        );
    }

    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload video to Cloudinary: ${error}`);
  }
};

/**
 * Delete a video from Cloudinary
 */
export const deleteVideoFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete video from Cloudinary: ${error}`);
  }
};

/**
 * Generate a signed URL for video access with expiration
 */
export const generateSignedVideoUrl = (
  publicId: string,
  expirationTime: number = 3600 // 1 hour default
): string => {
  return cloudinary.utils.private_download_url(publicId, 'video', {
    expires_at: Math.floor(Date.now() / 1000) + expirationTime,
  });
};

/**
 * Get video metadata from Cloudinary
 */
export const getVideoMetadata = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: 'video' });
    return result;
  } catch (error) {
    console.error('Cloudinary metadata error:', error);
    throw new Error(`Failed to get video metadata from Cloudinary: ${error}`);
  }
};

export default cloudinary;
