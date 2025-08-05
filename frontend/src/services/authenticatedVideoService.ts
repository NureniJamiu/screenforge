import { VideoService } from './videoService';
import type { ProcessedVideo } from '../types/recording';

export class AuthenticatedVideoService {
  /**
   * Execute a VideoService call with proper Clerk authentication
   */
  private static async withAuth<T>(
    operation: () => Promise<T>,
    token: string
  ): Promise<T> {
    // Store current token temporarily
    const originalToken = localStorage.getItem('clerk-db-jwt');

    try {
      // Set the new token
      localStorage.setItem('clerk-db-jwt', token);

      // Execute the operation
      return await operation();
    } finally {
      // Restore original token state
      if (originalToken) {
        localStorage.setItem('clerk-db-jwt', originalToken);
      } else {
        localStorage.removeItem('clerk-db-jwt');
      }
    }
  }

  static async getVideo(id: string, token: string): Promise<ProcessedVideo> {
    return this.withAuth(() => VideoService.getVideo(id), token);
  }

  static async updateVideo(
    id: string,
    data: Partial<ProcessedVideo>,
    token: string
  ): Promise<ProcessedVideo> {
    return this.withAuth(() => VideoService.updateVideo(id, data), token);
  }

  static async generateShareToken(id: string, token: string): Promise<ProcessedVideo> {
    return this.withAuth(() => VideoService.generateShareToken(id), token);
  }

  static async getAllVideos(token: string): Promise<ProcessedVideo[]> {
    return this.withAuth(() => VideoService.getAllVideos(), token);
  }

  static async deleteVideo(id: string, token: string): Promise<void> {
    return this.withAuth(() => VideoService.deleteVideo(id), token);
  }

  // Pass-through methods that don't require authentication
  static getVideoUrl(videoUrl: string): string {
    return VideoService.getVideoUrl(videoUrl);
  }

  static getThumbnailUrl(thumbnailUrl: string | undefined): string | undefined {
    return VideoService.getThumbnailUrl(thumbnailUrl);
  }

  static async getSharedVideo(shareToken: string): Promise<ProcessedVideo> {
    return VideoService.getSharedVideo(shareToken);
  }
}
