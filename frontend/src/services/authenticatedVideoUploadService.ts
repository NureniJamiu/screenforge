import { VideoUploadService } from './videoUploadService';
import type { ProcessedVideo, VideoUploadProgress } from '../types/recording';

export class AuthenticatedVideoUploadService {
  private uploadService: VideoUploadService;

  constructor() {
    this.uploadService = new VideoUploadService();
  }

  /**
   * Upload video with proper Clerk authentication
   */
  async uploadVideo(
    blob: Blob,
    metadata: {
      title: string;
      description?: string;
      recordingType: string;
      duration: number;
      isDownloadable?: boolean;
    },
    token: string,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<ProcessedVideo> {
    // Store current token temporarily
    const originalToken = localStorage.getItem('clerk-db-jwt');

    try {
      // Set the authentication token
      localStorage.setItem('clerk-db-jwt', token);

      // Execute the upload
      return await this.uploadService.uploadVideo(blob, metadata, onProgress);
    } finally {
      // Restore original token state
      if (originalToken) {
        localStorage.setItem('clerk-db-jwt', originalToken);
      } else {
        localStorage.removeItem('clerk-db-jwt');
      }
    }
  }

  /**
   * Upload video in chunks with proper Clerk authentication
   */
  async uploadVideoChunks(
    blob: Blob,
    metadata: {
      title: string;
      description?: string;
      recordingType: string;
      duration: number;
      isDownloadable?: boolean;
    },
    token: string,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<ProcessedVideo> {
    // Store current token temporarily
    const originalToken = localStorage.getItem('clerk-db-jwt');

    try {
      // Set the authentication token
      localStorage.setItem('clerk-db-jwt', token);

      // Execute the chunked upload
      return await this.uploadService.uploadVideoChunks(blob, metadata, onProgress);
    } finally {
      // Restore original token state
      if (originalToken) {
        localStorage.setItem('clerk-db-jwt', originalToken);
      } else {
        localStorage.removeItem('clerk-db-jwt');
      }
    }
  }

  /**
   * Start live session with proper Clerk authentication
   */
  async startLiveSession(metadata: any, token: string): Promise<string> {
    // Store current token temporarily
    const originalToken = localStorage.getItem('clerk-db-jwt');

    try {
      // Set the authentication token
      localStorage.setItem('clerk-db-jwt', token);

      // Start the live session
      return await this.uploadService.startLiveSession(metadata);
    } finally {
      // Restore original token state
      if (originalToken) {
        localStorage.setItem('clerk-db-jwt', originalToken);
      } else {
        localStorage.removeItem('clerk-db-jwt');
      }
    }
  }

  /**
   * Upload chunk to live session with proper Clerk authentication
   */
  async uploadRecordingChunk(
    chunk: Blob,
    sessionId: string,
    chunkIndex: number,
    token: string
  ): Promise<void> {
    // Store current token temporarily
    const originalToken = localStorage.getItem('clerk-db-jwt');

    try {
      // Set the authentication token
      localStorage.setItem('clerk-db-jwt', token);

      // Upload recording chunk
      return await this.uploadService.uploadRecordingChunk(chunk, sessionId, chunkIndex);
    } finally {
      // Restore original token state
      if (originalToken) {
        localStorage.setItem('clerk-db-jwt', originalToken);
      } else {
        localStorage.removeItem('clerk-db-jwt');
      }
    }
  }

  /**
   * Finalize live session with proper Clerk authentication
   */
  async finalizeLiveSession(sessionId: string, token: string): Promise<ProcessedVideo> {
    // Store current token temporarily
    const originalToken = localStorage.getItem('clerk-db-jwt');

    try {
      // Set the authentication token
      localStorage.setItem('clerk-db-jwt', token);

      // Finalize the live session
      return await this.uploadService.finalizeLiveSession(sessionId);
    } finally {
      // Restore original token state
      if (originalToken) {
        localStorage.setItem('clerk-db-jwt', originalToken);
      } else {
        localStorage.removeItem('clerk-db-jwt');
      }
    }
  }

  /**
   * Cancel current upload
   */
  cancelUpload(): void {
    this.uploadService.cancelUpload();
  }
}
