import { VideoService } from './videoService';
import type { ProcessedVideo } from '../types/recording';

export class AuthenticatedVideoService {
    static async getVideo(id: string, token: string): Promise<ProcessedVideo> {
        return VideoService.getVideo(id, token);
    }

    static async updateVideo(
        id: string,
        data: Partial<ProcessedVideo>,
        token: string
    ): Promise<ProcessedVideo> {
        return VideoService.updateVideo(id, data, token);
    }

    static async generateShareToken(
        id: string,
        token: string
    ): Promise<ProcessedVideo> {
        return VideoService.generateShareToken(id, token);
    }

    static async getAllVideos(token: string): Promise<ProcessedVideo[]> {
        return VideoService.getAllVideos(token);
    }

    static async deleteVideo(id: string, token: string): Promise<void> {
        return VideoService.deleteVideo(id, token);
    }

    // Pass-through methods that don't require authentication
    static getVideoUrl(videoUrl: string): string {
        return VideoService.getVideoUrl(videoUrl);
    }

    static getThumbnailUrl(
        thumbnailUrl: string | undefined
    ): string | undefined {
        return VideoService.getThumbnailUrl(thumbnailUrl);
    }

    static async getSharedVideo(shareToken: string): Promise<ProcessedVideo> {
        return VideoService.getSharedVideo(shareToken);
    }
}
