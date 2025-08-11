import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { getPrisma } from "../index";

interface VideoMetadata {
    duration: number;
    resolution: string;
    size: number;
    mimeType: string;
}

export class VideoProcessor {
    static async extractMetadata(
        filePath: string
    ): Promise<VideoMetadata | null> {
        return new Promise((resolve) => {
            // Use ffprobe to extract video metadata
            const ffprobe = spawn("ffprobe", [
                "-v",
                "quiet",
                "-print_format",
                "json",
                "-show_format",
                "-show_streams",
                filePath,
            ]);

            let output = "";

            ffprobe.stdout.on("data", (data) => {
                output += data.toString();
            });

            ffprobe.on("close", (code) => {
                if (code !== 0) {
                    console.warn(
                        "ffprobe failed, falling back to basic metadata"
                    );
                    resolve(null);
                    return;
                }

                try {
                    const metadata = JSON.parse(output);
                    const videoStream = metadata.streams.find(
                        (stream: any) => stream.codec_type === "video"
                    );

                    if (!videoStream) {
                        resolve(null);
                        return;
                    }

                    const stats = fs.statSync(filePath);

                    resolve({
                        duration: parseFloat(metadata.format.duration) || 0,
                        resolution: `${videoStream.width}x${videoStream.height}`,
                        size: stats.size,
                        mimeType: this.getMimeTypeFromCodec(
                            videoStream.codec_name
                        ),
                    });
                } catch (error) {
                    console.error("Error parsing ffprobe output:", error);
                    resolve(null);
                }
            });

            ffprobe.on("error", (error) => {
                console.warn("ffprobe error:", error.message);
                resolve(null);
            });
        });
    }

    static async generateThumbnail(
        videoId: string,
        videoPath: string,
        outputDir: string
    ): Promise<string | null> {
        try {
            const thumbnailPath = path.join(
                outputDir,
                `${videoId}_thumbnail.jpg`
            );

            return new Promise((resolve) => {
                const ffmpeg = spawn("ffmpeg", [
                    "-i",
                    videoPath,
                    "-ss",
                    "00:00:01.000", // Take screenshot at 1 second
                    "-vframes",
                    "1",
                    "-f",
                    "image2",
                    "-vf",
                    "scale=320:240", // Resize to thumbnail size
                    "-y", // Overwrite output file
                    thumbnailPath,
                ]);

                ffmpeg.on("close", (code) => {
                    if (code === 0 && fs.existsSync(thumbnailPath)) {
                        resolve(`/uploads/thumbnails/${videoId}_thumbnail.jpg`);
                    } else {
                        console.warn("Thumbnail generation failed");
                        resolve(null);
                    }
                });

                ffmpeg.on("error", (error) => {
                    console.warn("FFmpeg error:", error.message);
                    resolve(null);
                });
            });
        } catch (error) {
            console.error("Error generating thumbnail:", error);
            return null;
        }
    }

    static async processVideo(videoId: string): Promise<void> {
        try {
            const video = await getPrisma().video.findUnique({
                where: { id: videoId },
            });

            if (!video) {
                console.error("Video not found:", videoId);
                return;
            }

            // Skip processing for Cloudinary videos (no local file)
            if (video.storageProvider === "CLOUDINARY" || !video.filename) {
                return;
            }

            const videoPath = path.join(
                __dirname,
                "../../uploads",
                video.filename
            );

            if (!fs.existsSync(videoPath)) {
                console.error("Video file not found:", videoPath);
                return;
            }

            // Extract metadata
            const metadata = await this.extractMetadata(videoPath);

            // Create thumbnails directory if it doesn't exist
            const thumbnailDir = path.join(
                __dirname,
                "../../uploads/thumbnails"
            );
            if (!fs.existsSync(thumbnailDir)) {
                fs.mkdirSync(thumbnailDir, { recursive: true });
            }

            // Generate thumbnail
            const thumbnailUrl = await this.generateThumbnail(
                videoId,
                videoPath,
                thumbnailDir
            );

            // Update video record with metadata and thumbnail
            const updateData: any = {};

            if (metadata) {
                updateData.duration = metadata.duration;
                updateData.resolution = metadata.resolution;
            }

            if (thumbnailUrl) {
                updateData.thumbnailUrl = thumbnailUrl;
            }

            if (Object.keys(updateData).length > 0) {
                await getPrisma().video.update({
                    where: { id: videoId },
                    data: updateData,
                });
            }
        } catch (error) {
            console.error("Error processing video:", error);
        }
    }

    private static getMimeTypeFromCodec(codec: string): string {
        const codecMap: Record<string, string> = {
            vp8: "video/webm",
            vp9: "video/webm",
            h264: "video/mp4",
            h265: "video/mp4",
            av1: "video/webm",
        };

        return codecMap[codec] || "video/webm";
    }

    // Utility to convert video to different formats if needed
    static async convertVideo(
        inputPath: string,
        outputPath: string,
        format: "mp4" | "webm" = "mp4"
    ): Promise<boolean> {
        return new Promise((resolve) => {
            const args = [
                "-i",
                inputPath,
                "-c:v",
                format === "mp4" ? "libx264" : "libvpx-vp9",
                "-c:a",
                format === "mp4" ? "aac" : "libopus",
                "-crf",
                "23", // Quality setting
                "-preset",
                "medium", // Encoding speed
                "-y", // Overwrite output
                outputPath,
            ];

            const ffmpeg = spawn("ffmpeg", args);

            ffmpeg.on("close", (code) => {
                resolve(code === 0);
            });

            ffmpeg.on("error", (error) => {
                console.error("Conversion error:", error);
                resolve(false);
            });
        });
    }

    // Queue video for background processing
    static queueVideoProcessing(videoId: string): void {
        // In a production environment, you'd use a proper job queue like Bull or Agenda
        // For now, we'll process asynchronously
        setImmediate(() => {
            this.processVideo(videoId).catch((error) => {
                console.error("Background video processing failed:", error);
            });
        });
    }
}

// Background job to clean up old temporary files
export function startCleanupJob(): void {
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  setInterval(() => {
    const tempDir = path.join(__dirname, '../../uploads/temp');

    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      const now = Date.now();

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > MAX_AGE) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }, CLEANUP_INTERVAL);
}
