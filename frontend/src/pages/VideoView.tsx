import { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import {
    Download,
    Share2,
    Eye,
    Calendar,
    Twitter,
    Facebook,
    Linkedin,
    Link2,
    Copy,
    Video,
} from "lucide-react";
import { VideoService } from "../services/videoService";
import { VideoSEO } from "../components/SEOHead";
import type { ProcessedVideo } from "../types/recording";

export function VideoView() {
    const { shareToken } = useParams();
    const [video, setVideo] = useState<ProcessedVideo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const formatDuration = (duration: number | null) => {
        if (!duration) return "Unknown";
        const mins = Math.floor(duration / 60);
        const secs = Math.floor(duration % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        const fetchVideo = async () => {
            if (!shareToken) {
                setError("No share token provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const videoData = await VideoService.getSharedVideo(shareToken);
                setVideo(videoData);
                setError(null);
            } catch (err) {
                console.error("Error fetching shared video:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Video not found or access denied"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [shareToken]);

    const handleDownload = async () => {
      try {
        const response = await fetch(video.videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = video.originalName || `video-${video.id}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Error downloading video:", error);
      }
    };

    const shareUrl = window.location.href;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const shareOnSocial = (platform: string) => {
        const text = `Check out this video: ${video?.title}`;
        const url = encodeURIComponent(shareUrl);
        const textEncoded = encodeURIComponent(text);

        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${textEncoded}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        };

        window.open(
            urls[platform as keyof typeof urls],
            "_blank",
            "width=600,height=400"
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading video...</p>
                </div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Video Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error ||
                            "The video you're looking for doesn't exist or has been removed."}
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {video && (
                <VideoSEO
                    title={video.title || "Screen Recording"}
                    description={
                        video.description ||
                        `Watch this screen recording created with ScreenForge.`
                    }
                    videoUrl={window.location.href}
                    thumbnailUrl={video.thumbnailUrl}
                    duration={video.duration || undefined}
                    uploadDate={video.createdAt}
                />
            )}
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <Video className="h-8 w-8 text-primary-600 dark:text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">
                                ScreenForge
                            </span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            {video.isDownloadable && (
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </button>
                            )}
                            <button
                                onClick={handleCopyLink}
                                className={`flex items-center border border-gray-300 px-4 py-2 rounded-lg transition-colors ${
                                    copied
                                        ? "bg-green-50 border-green-300 text-green-700"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="h-4 w-4 mr-2" />
                                        Copy Link
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Video Player */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="aspect-video bg-gray-900">
                                <video
                                    className="w-full h-full"
                                    controls
                                    poster={
                                        video.thumbnailUrl
                                            ? VideoService.getThumbnailUrl(
                                                  video.thumbnailUrl
                                              )
                                            : undefined
                                    }
                                >
                                    <source
                                        src={VideoService.getVideoUrl(
                                            video.videoUrl
                                        )}
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {video.title}
                                </h1>
                                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                                    <span className="flex items-center">
                                        <Eye className="h-4 w-4 mr-1" />
                                        {(
                                            video.viewCount || 0
                                        ).toLocaleString()}{" "}
                                        views
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(
                                            video.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                    <span>
                                        {formatDuration(video.duration)}
                                    </span>
                                </div>

                                {video.description && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            Description
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {video.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Share Options */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Share2 className="h-5 w-5 mr-2" />
                                Share this video
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => shareOnSocial("twitter")}
                                    className="w-full flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Twitter className="h-4 w-4 mr-2" />
                                    Share on Twitter
                                </button>
                                <button
                                    onClick={() => shareOnSocial("facebook")}
                                    className="w-full flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Facebook className="h-4 w-4 mr-2" />
                                    Share on Facebook
                                </button>
                                <button
                                    onClick={() => shareOnSocial("linkedin")}
                                    className="w-full flex items-center bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                                >
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    Share on LinkedIn
                                </button>
                            </div>
                        </div>

                        {/* Download Info */}
                        {video.isDownloadable ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                                    <Download className="h-5 w-5 mr-2" />
                                    Download Available
                                </h3>
                                <p className="text-sm text-green-700 mb-4">
                                    This video is available for download in MP4
                                    format.
                                </p>
                                <button
                                    onClick={handleDownload}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Download Video
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Download Disabled
                                </h3>
                                <p className="text-sm text-gray-600">
                                    The creator has disabled downloads for this
                                    video.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
