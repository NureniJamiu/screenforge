import type { ProcessedVideo, VideoUploadProgress } from '../types/recording';

// Determine API base URL based on environment
const getApiBase = (): string => {
    // First check environment variable
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // For development, use localhost
    if (import.meta.env.DEV) {
        return 'http://localhost:3001/api';
    }

    // For production, check if we're on the main domain
    const currentHost = window.location.hostname;
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }

    // In production, try to determine the correct backend URL
    if (currentHost === 'screenforge.vercel.app') {
        // The backend should be deployed to the same Vercel project
        // but for now, let's use a relative path which should work if both are deployed together
        return '/api';
    }

    // Fallback to relative API path
    return '/api';
};

const API_BASE = getApiBase();

export class VideoUploadService {
  private currentUploadController: AbortController | null = null;
  private currentChunkedUploadId: string | null = null;

  async uploadVideo(
    blob: Blob,
    metadata: {
      title: string;
      description?: string;
      recordingType: string;
      duration: number;
      isDownloadable?: boolean;
    },
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<ProcessedVideo> {
    return new Promise((resolve, reject) => {
      // Create an abort controller for this upload
      this.currentUploadController = new AbortController();

      const formData = new FormData();

      // Create file from blob - ensure we have a valid video MIME type
      let videoMimeType = blob.type;

      // If blob doesn't have a type or it's not a video type, default to webm
      if (!videoMimeType || !videoMimeType.startsWith('video/')) {
        videoMimeType = 'video/webm';
      }

      const file = new File([blob], `recording-${Date.now()}.webm`, {
        type: videoMimeType
      });

      formData.append('video', file);
      formData.append('title', metadata.title);
      formData.append('description', metadata.description || '');
      formData.append('recordingType', metadata.recordingType);
      formData.append('duration', metadata.duration.toString());
      formData.append('isDownloadable', (metadata.isDownloadable ?? true).toString());

      const xhr = new XMLHttpRequest();

      // Handle abort signal
      this.currentUploadController.signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled by user'));
      });

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: VideoUploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        this.currentUploadController = null; // Clear controller on completion
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
          } catch (parseError) {
              reject(new Error("Invalid response format"));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        this.currentUploadController = null; // Clear controller on error
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        this.currentUploadController = null; // Clear controller on timeout
        reject(new Error('Upload timeout'));
      });

      xhr.addEventListener('abort', () => {
        this.currentUploadController = null; // Clear controller on abort
        reject(new Error('Upload cancelled'));
      });

      // Set timeout to 10 minutes for large files
      xhr.timeout = 10 * 60 * 1000;

      // Open the request first
      xhr.open('POST', `${API_BASE}/videos/upload`);

      // Add auth header after opening the request
      const token = localStorage.getItem('clerk-db-jwt');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  async uploadVideoChunks(
    blob: Blob,
    metadata: {
      title: string;
      description?: string;
      recordingType: string;
      duration: number;
      isDownloadable?: boolean;
    },
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<ProcessedVideo> {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(blob.size / CHUNK_SIZE);
    const uploadId = this.generateUploadId();

    // Store the current upload ID for cancellation
    this.currentChunkedUploadId = uploadId;
    this.currentUploadController = new AbortController();

    try {
      // Initialize chunked upload
      await this.initializeChunkedUpload(uploadId, metadata, totalChunks);

      // Upload chunks
      for (let i = 0; i < totalChunks; i++) {
        // Check if upload was cancelled
        if (this.currentUploadController?.signal.aborted) {
          throw new Error('Upload cancelled by user');
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, blob.size);
        const chunk = blob.slice(start, end);

        await this.uploadChunk(uploadId, i, chunk);

        // Update progress
        if (onProgress) {
          const progress: VideoUploadProgress = {
            loaded: end,
            total: blob.size,
            percentage: Math.round((end / blob.size) * 100)
          };
          onProgress(progress);
        }
      }

      // Finalize upload
      const result = await this.finalizeChunkedUpload(uploadId);

      // Clear upload state on success
      this.currentChunkedUploadId = null;
      this.currentUploadController = null;

      return result;

    } catch (error) {
      // Cleanup failed upload
      await this.cleanupFailedUpload(uploadId);

      // Clear upload state on error
      this.currentChunkedUploadId = null;
      this.currentUploadController = null;

      throw error;
    }
  }

  cancelUpload(): void {
    if (this.currentUploadController) {
      this.currentUploadController.abort();
    }

    // Also cleanup chunked upload if exists
    if (this.currentChunkedUploadId) {
      this.cleanupFailedUpload(this.currentChunkedUploadId).catch(console.warn);
    }
  }

  isUploading(): boolean {
    return this.currentUploadController !== null;
  }

  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeChunkedUpload(
    uploadId: string,
    metadata: any,
    totalChunks: number
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/videos/upload/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('clerk-db-jwt')}`
      },
      body: JSON.stringify({
        uploadId,
        metadata,
        totalChunks
      })
    });

    if (!response.ok) {
      throw new Error('Failed to initialize chunked upload');
    }
  }

  private async uploadChunk(
    uploadId: string,
    chunkIndex: number,
    chunk: Blob
  ): Promise<void> {
    const formData = new FormData();
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('chunk', chunk);

    const response = await fetch(`${API_BASE}/videos/upload/chunk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('clerk-db-jwt')}`
      },
      body: formData,
      signal: this.currentUploadController?.signal
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk ${chunkIndex}`);
    }
  }

  private async finalizeChunkedUpload(uploadId: string): Promise<ProcessedVideo> {
    const response = await fetch(`${API_BASE}/videos/upload/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('clerk-db-jwt')}`
      },
      body: JSON.stringify({ uploadId })
    });

    if (!response.ok) {
      throw new Error('Failed to finalize upload');
    }

    return response.json();
  }

  private async cleanupFailedUpload(uploadId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/videos/upload/cleanup`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('clerk-db-jwt')}`
        },
        body: JSON.stringify({ uploadId })
      });
    } catch (error) {
      console.warn('Failed to cleanup upload:', error);
    }
  }

  // Progressive upload for real-time chunks during recording
  async uploadRecordingChunk(
    chunk: Blob,
    sessionId: string,
    chunkIndex: number
  ): Promise<void> {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('chunk', chunk);

    const response = await fetch(`${API_BASE}/videos/upload/live-chunk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('clerk-db-jwt')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload live chunk ${chunkIndex}`);
    }
  }

  async startLiveSession(metadata: any): Promise<string> {
    const response = await fetch(`${API_BASE}/videos/upload/live-start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('clerk-db-jwt')}`
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error('Failed to start live session');
    }

    const result = await response.json();
    return result.sessionId;
  }

  async finalizeLiveSession(sessionId: string): Promise<ProcessedVideo> {
    const response = await fetch(`${API_BASE}/videos/upload/live-finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('clerk-db-jwt')}`
      },
      body: JSON.stringify({ sessionId })
    });

    if (!response.ok) {
      throw new Error('Failed to finalize live session');
    }

    return response.json();
  }
}
