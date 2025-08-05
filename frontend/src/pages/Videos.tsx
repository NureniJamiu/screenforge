import { useState, useEffect } from "react";
import {
    Video,
    Filter,
    Search,
    Play,
    Edit,
    Share2,
    Trash2,
    Download,
    Calendar,
    Clock,
    X,
    ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { VideoService } from "../services/videoService";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { ProcessedVideo } from "../types/recording";

export function Videos() {
    const [videos, setVideos] = useState<ProcessedVideo[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPeriod, setFilterPeriod] = useState("all");
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<ProcessedVideo | null>(
        null
    );

    const getShareUrl = () => {
        if (!selectedVideo) return "";
        const idOrToken = selectedVideo.shareToken || selectedVideo.id;
        return `${window.location.origin}/video/${idOrToken}`;
    };
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl());
            alert("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };
    const shareToSocial = (platform: string) => {
        if (!selectedVideo) return;
        const videoUrl = getShareUrl();
        const text = selectedVideo.title;
        let shareUrl = "";
        switch (platform) {
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    text
                )}&url=${encodeURIComponent(videoUrl)}`;
                break;
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    videoUrl
                )}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    videoUrl
                )}`;
                break;
            case "whatsapp":
                shareUrl = `https://wa.me/?text=${encodeURIComponent(
                    text + " " + videoUrl
                )}`;
                break;
            default:
                return;
        }
        window.open(shareUrl, "_blank", "width=600,height=400");
        setShowShareModal(false);
    };

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const videoData = await VideoService.getAllVideos();
                setVideos(videoData);
                setError(null);
            } catch (err) {
                console.error("Error fetching videos:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load videos"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const filteredVideos = videos.filter((video) => {
        const matchesSearch = video.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        if (filterPeriod === "all") return matchesSearch;

        const videoDate = new Date(video.createdAt);
        const now = new Date();
        const daysDiff = Math.floor(
            (now.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (filterPeriod === "week") return matchesSearch && daysDiff <= 7;
        if (filterPeriod === "month") return matchesSearch && daysDiff <= 30;

        return matchesSearch;
    });

    const formatFileSize = (bytes: number) => {
        const sizes = ["Bytes", "KB", "MB", "GB"];
        if (bytes === 0) return "0 Bytes";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (
            Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
        );
    };

    const formatDuration = (duration: number | null) => {
        if (!duration) return "Unknown";
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleDelete = async (videoId: string) => {
        try {
            await VideoService.deleteVideo(videoId);
            setVideos(videos.filter((v) => v.id !== videoId));
        } catch (err) {
            console.error("Error deleting video:", err);
            alert("Failed to delete video. Please try again.");
        }
    };
    const openDeleteDialog = (videoId: string) => {
        setDeleteId(videoId);
        setConfirmOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (deleteId) await handleDelete(deleteId);
        setConfirmOpen(false);
        setDeleteId(null);
    };
    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setDeleteId(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        My Videos
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage all your screen recordings ({videos.length}{" "}
                        videos)
                    </p>
                </div>
                <Link
                    to="/dashboard/record"
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150"
                >
                    <Video className="h-4 w-4 mr-2" />
                    New Recording
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                            Filter by:
                        </span>
                    </div>
                    <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">All Videos</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    <div className="flex items-center space-x-2 ml-auto">
                        <Search className="h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading videos...</p>
                </div>
            ) : error ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredVideos.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    {videos.length === 0 ? (
                        <>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No videos yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start by creating your first screen recording.
                            </p>
                            <Link
                                to="/dashboard/record"
                                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Video className="h-4 w-4 mr-2" />
                                Create Recording
                            </Link>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No videos match your search
                            </h3>
                            <p className="text-gray-600">
                                Try adjusting your search terms or filters.
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                        {filteredVideos.map((video) => (
                            <div
                                key={video.id}
                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Video Thumbnail/Preview */}
                                <div className="aspect-video bg-gray-100 relative group">
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={VideoService.getThumbnailUrl(
                                                video.thumbnailUrl
                                            )}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                            muted
                                        >
                                            <source
                                                src={VideoService.getVideoUrl(
                                                    video.videoUrl
                                                )}
                                                type="video/webm"
                                            />
                                            <source
                                                src={VideoService.getVideoUrl(
                                                    video.videoUrl
                                                )}
                                                type="video/mp4"
                                            />
                                        </video>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                        <Link
                                            to={`/dashboard/edit/${video.id}`}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100"
                                        >
                                            <Play className="h-6 w-6 text-gray-800" />
                                        </Link>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                        {formatDuration(video.duration)}
                                    </div>
                                </div>

                                {/* Video Info */}
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                        {video.title}
                                    </h3>

                                    <div className="flex items-center text-sm text-gray-600 mb-3">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>
                                            {formatDate(video.createdAt)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <span>
                                            {formatFileSize(video.size)}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {formatDuration(video.duration)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/dashboard/edit/${video.id}`}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setSelectedVideo(video);
                                                    setShowShareModal(true);
                                                }}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Share"
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteDialog(video.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <Link
                                            to={VideoService.getVideoUrl(
                                                video.videoUrl
                                            )}
                                            target="_blank"
                                            className="p-2 text-gray-600 hover:text-gray-900"
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Share Modal */}
                    {showShareModal && (
                        <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-50 flex items-center justify-center z-50">
                            <div className="bg-white/95 backdrop-blur-md rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Share Video
                                    </h3>
                                    <button
                                        onClick={() => setShowShareModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Share Link
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                value={getShareUrl()}
                                                readOnly
                                                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-sm"
                                            />
                                            <button
                                                onClick={copyToClipboard}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 text-sm"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Share on Social Media
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() =>
                                                    shareToSocial("twitter")
                                                }
                                                className="flex items-center justify-center px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Twitter
                                            </button>
                                            <button
                                                onClick={() =>
                                                    shareToSocial("facebook")
                                                }
                                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Facebook
                                            </button>
                                            <button
                                                onClick={() =>
                                                    shareToSocial("linkedin")
                                                }
                                                className="flex items-center justify-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                LinkedIn
                                            </button>
                                            <button
                                                onClick={() =>
                                                    shareToSocial("whatsapp")
                                                }
                                                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Confirm Delete Dialog */}
                    <ConfirmDialog
                        isOpen={confirmOpen}
                        message="Are you sure you want to delete this video? This action cannot be undone."
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                    />
                </div>
            )}
        </div>
    );
}
