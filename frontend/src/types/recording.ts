export type RecordingMode = 'tab' | 'window' | 'desktop';

export interface RecordingConfig {
  mode: RecordingMode;
  audioEnabled: boolean;
  micEnabled: boolean;
  quality: 'standard' | 'high' | 'ultra';
}

export interface VideoUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ProcessedVideo {
    id: string;
    title: string;
    filename?: string; // Made optional since Cloudinary videos don't have local filenames
    videoUrl: string;
    duration: number | null;
    size: number;
    thumbnailUrl?: string;
    cloudinaryPublicId?: string; // Cloudinary public ID
    cloudinaryUrl?: string; // Cloudinary secure URL
    storageProvider?: "LOCAL" | "CLOUDINARY"; // Storage provider type
    createdAt: string;
    isDownloadable?: boolean;
    isPublic?: boolean;
    description?: string;
    mimeType?: string;
    recordingType?: string;
    shareToken?: string;
    viewCount?: number;
    user?: {
        firstName?: string;
        lastName?: string;
    };
}
