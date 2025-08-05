import type { ProcessedVideo } from '../types/recording';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class VideoService {
  private static getAuthToken(): string | null {
    return localStorage.getItem('clerk-db-jwt');
  }

  private static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken();

    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response;
  }

  static async getAllVideos(): Promise<ProcessedVideo[]> {
    try {
      const response = await this.fetch('/videos');
      return await response.json();
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  static async getVideo(id: string): Promise<ProcessedVideo> {
    try {
      const response = await this.fetch(`/videos/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  static async updateVideo(id: string, data: Partial<ProcessedVideo>): Promise<ProcessedVideo> {
    try {
      const response = await this.fetch(`/videos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  }

  static async deleteVideo(id: string): Promise<void> {
    try {
      await this.fetch(`/videos/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  static async generateShareToken(id: string): Promise<ProcessedVideo> {
    try {
      const response = await this.fetch(`/videos/${id}/share`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating share token:', error);
      throw error;
    }
  }

  static async getSharedVideo(shareToken: string): Promise<ProcessedVideo> {
    try {
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/shares/video/${shareToken}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching shared video:', error);
      throw error;
    }
  }

  static getVideoUrl(videoUrl: string): string {
    // If it's already a full URL (like Cloudinary), return as-is
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl;
    }

    // For relative URLs, remove /api prefix if present and construct full URL
    const cleanUrl = videoUrl.startsWith('/api') ? videoUrl.substring(4) : videoUrl;
    const baseUrl = API_BASE.replace('/api', '');
    return `${baseUrl}${cleanUrl}`;
  }

  static getThumbnailUrl(thumbnailUrl: string | undefined): string | undefined {
    if (!thumbnailUrl) return undefined;

    // If it's already a full URL (like Cloudinary), return as-is
    if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
      return thumbnailUrl;
    }

    // For relative URLs, remove /api prefix if present and construct full URL
    const cleanUrl = thumbnailUrl.startsWith('/api') ? thumbnailUrl.substring(4) : thumbnailUrl;
    const baseUrl = API_BASE.replace('/api', '');
    return `${baseUrl}${cleanUrl}`;
  }
}
