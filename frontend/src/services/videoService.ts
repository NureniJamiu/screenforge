import type { ProcessedVideo } from '../types/recording';

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
};const API_BASE = getApiBase();

export class VideoService {
    private static async fetch(
        url: string,
        options: RequestInit = {},
        token?: string | null
    ): Promise<Response> {
        if (!token) {
            throw new Error("No authorization token provided");
        }

        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            credentials: 'include', // Include credentials for CORS requests
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return response;
    }

    static async getAllVideos(
        token?: string | null
    ): Promise<ProcessedVideo[]> {
        try {
            const response = await this.fetch("/videos", {}, token);
            return await response.json();
        } catch (error) {
            console.error("Error fetching videos:", error);
            throw error;
        }
    }

    static async getVideo(
        id: string,
        token?: string | null
    ): Promise<ProcessedVideo> {
        try {
            const response = await this.fetch(`/videos/${id}`, {}, token);
            return await response.json();
        } catch (error) {
            console.error("Error fetching video:", error);
            throw error;
        }
    }

    static async updateVideo(
        id: string,
        data: Partial<ProcessedVideo>,
        token?: string | null
    ): Promise<ProcessedVideo> {
        try {
            const response = await this.fetch(
                `/videos/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data),
                },
                token
            );
            return await response.json();
        } catch (error) {
            console.error("Error updating video:", error);
            throw error;
        }
    }

    static async deleteVideo(id: string, token?: string | null): Promise<void> {
        try {
            await this.fetch(
                `/videos/${id}`,
                {
                    method: "DELETE",
                },
                token
            );
        } catch (error) {
            console.error("Error deleting video:", error);
            throw error;
        }
    }

    static async generateShareToken(
        id: string,
        token?: string | null
    ): Promise<ProcessedVideo> {
        try {
            const response = await this.fetch(
                `/videos/${id}/share`,
                {
                    method: "POST",
                },
                token
            );
            return await response.json();
        } catch (error) {
            console.error("Error generating share token:", error);
            throw error;
        }
    }

    static async getSharedVideo(shareToken: string): Promise<ProcessedVideo> {
        try {
            const response = await fetch(
                `${API_BASE.replace("/api", "")}/api/shares/video/${shareToken}`,
                {
                    credentials: 'include' // Include credentials for CORS requests
                }
            );

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching shared video:", error);
            throw error;
        }
    }

    static getVideoUrl(videoUrl: string): string {
        // If it's already a full URL (like Cloudinary), return as-is
        if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
            return videoUrl;
        }

        // For relative URLs, remove /api prefix if present and construct full URL
        const cleanUrl = videoUrl.startsWith("/api")
            ? videoUrl.substring(4)
            : videoUrl;
        const baseUrl = API_BASE.replace("/api", "");
        return `${baseUrl}${cleanUrl}`;
    }

    static getThumbnailUrl(
        thumbnailUrl: string | undefined
    ): string | undefined {
        if (!thumbnailUrl) return undefined;

        // If it's already a full URL (like Cloudinary), return as-is
        if (
            thumbnailUrl.startsWith("http://") ||
            thumbnailUrl.startsWith("https://")
        ) {
            return thumbnailUrl;
        }

        // For relative URLs, remove /api prefix if present and construct full URL
        const cleanUrl = thumbnailUrl.startsWith("/api")
            ? thumbnailUrl.substring(4)
            : thumbnailUrl;
        const baseUrl = API_BASE.replace("/api", "");
        return `${baseUrl}${cleanUrl}`;
    }
}
