import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react";
import {
    Save,
    Share2,
    Scissors,
    Type,
    Download,
    ChevronLeft,
    Upload,
    Sparkles,
    Loader2,
    X,
    ExternalLink,
} from "lucide-react";
import { AuthenticatedVideoService } from "../services/authenticatedVideoService";
import type { ProcessedVideo } from "../types/recording";

export function VideoEditor() {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const { getToken, isSignedIn } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);

    // const [isPlaying, setIsPlaying] = useState(false);
    // const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    // const [volume, setVolume] = useState(1);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [videoTitle, setVideoTitle] = useState("My Screen Recording");
    const [videoDescription, setVideoDescription] = useState("");
    const [downloadEnabled, setDownloadEnabled] = useState(true);
    const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
    const [hasCaptions, setHasCaptions] = useState(false);
    const [video, setVideo] = useState<ProcessedVideo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Fetch video data
    useEffect(() => {
        if (!videoId || !isSignedIn) {
            if (!videoId) {
                setError("No video ID provided");
            } else if (!isSignedIn) {
                setError("You must be signed in to access this video");
            }
            setLoading(false);
            return;
        }

        const fetchVideo = async () => {
            try {
                setLoading(true);

                // Get the current auth token from Clerk
                const token = await getToken();
                if (!token) {
                    setError("Authentication required to access video");
                    return;
                }

                const videoData = await AuthenticatedVideoService.getVideo(
                    videoId,
                    token
                );
                setVideo(videoData);
                setVideoTitle(videoData.title);
                setVideoDescription(videoData.description || "");
                setDownloadEnabled(videoData.isDownloadable !== false);
                setError(null);
            } catch (err) {
                console.error("Error fetching video:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load video"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [videoId, isSignedIn, getToken]);

    const videoSrc = video
        ? AuthenticatedVideoService.getVideoUrl(video.videoUrl)
        : null;

    useEffect(() => {
        if (videoRef.current && videoSrc) {
            const videoElement = videoRef.current;

            const handleLoadedMetadata = () => {
                setDuration(videoElement.duration);
                setTrimEnd(videoElement.duration);
            };

            const handleTimeUpdate = () => {
                // setCurrentTime(videoElement.currentTime);
            };

            videoElement.addEventListener(
                "loadedmetadata",
                handleLoadedMetadata
            );
            videoElement.addEventListener("timeupdate", handleTimeUpdate);

            return () => {
                videoElement.removeEventListener(
                    "loadedmetadata",
                    handleLoadedMetadata
                );
                videoElement.removeEventListener(
                    "timeupdate",
                    handleTimeUpdate
                );
            };
        }
    }, [videoSrc]);

    const formatTime = (time: number) => {
        if (!time || !isFinite(time) || isNaN(time)) {
            return "00:00";
        }
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    /* Commented out until needed for custom video controls
    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            // setCurrentTime(time);
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        // setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };
    */

    const generateCaptions = async () => {
        setIsGeneratingCaptions(true);
        // Simulate AI caption generation
        setTimeout(() => {
            setIsGeneratingCaptions(false);
            setHasCaptions(true);
        }, 3000);
    };

    const handleSave = async () => {
        if (!video || !isSignedIn) {
            if (!isSignedIn) {
                setError("You must be signed in to save videos");
            }
            return;
        }

        try {
            setSaving(true);

            // Get the current auth token from Clerk
            const token = await getToken();
            if (!token) {
                setError("Authentication required to save video");
                return;
            }

            // Update video metadata using authenticated service
            await AuthenticatedVideoService.updateVideo(
                video.id,
                {
                    title: videoTitle,
                    description: videoDescription,
                    isDownloadable: downloadEnabled,
                },
                token
            );

            // Here you would also handle trimming and other editing operations

            // Navigate back to videos list or dashboard
            navigate("/dashboard/videos");
        } catch (err) {
            console.error("Error saving video:", err);
            setError(
                err instanceof Error ? err.message : "Failed to save video"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleShare = async () => {
        // Generate share token if needed
        await generateShareToken();
        setShowShareModal(true);
    };

    const getVideoShareUrl = () => {
        if (!video) return "";
        const baseUrl = window.location.origin;
        // Use shareToken if available, otherwise fall back to video ID
        const shareIdentifier = video.shareToken || video.id;
        return `${baseUrl}/video/${shareIdentifier}`;
    };

    const generateShareToken = async () => {
        if (!video || video.shareToken || !isSignedIn) return video?.shareToken;

        try {
            // Get the current auth token from Clerk
            const token = await getToken();
            if (!token) {
                console.error(
                    "Authentication required to generate share token"
                );
                return null;
            }

            // Generate a share token using the authenticated service
            const updatedVideo =
                await AuthenticatedVideoService.generateShareToken(
                    video.id,
                    token
                );

            // Update local video state with the new share token
            setVideo(updatedVideo);
            return updatedVideo.shareToken;
        } catch (err) {
            console.error("Error generating share token:", err);
            return null;
        }
    };

    const shareToSocial = (platform: string) => {
        if (!video) return;

        const videoUrl = getVideoShareUrl();
        const text = videoDescription || videoTitle;

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
                    `${text} ${videoUrl}`
                )}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, "_blank", "width=600,height=400");
        setShowShareModal(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getVideoShareUrl());
            // You could add a toast notification here
            alert("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        You must be signed in to access the video editor
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading video...</p>
                </div>
            </div>
        );
    }

    if (error || !video || !videoSrc) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        {error || "Video not found"}
                    </p>
                    <button
                        onClick={() => navigate("/dashboard/videos")}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Back to Videos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate("/dashboard/videos")}
                            className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Video Editor
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Edit and enhance your recording
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Video Player */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="aspect-video bg-black relative">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-contain"
                                    controls
                                    preload="metadata"
                                >
                                    <source src={videoSrc} type="video/webm" />
                                    <source src={videoSrc} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Video Controls */}
                            {/* <div className="p-4 border-t border-gray-200">
                                <div className="flex items-center space-x-4 mb-4">
                                    <button
                                        onClick={handlePlayPause}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-4 w-4" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                    </button>

                                    <div className="flex-1">
                                        <input
                                            type="range"
                                            min="0"
                                            max={duration}
                                            value={currentTime}
                                            onChange={(e) =>
                                                handleSeek(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full"
                                        />
                                    </div>

                                    <span className="text-sm text-gray-600 min-w-max">
                                        {formatTime(currentTime)} /{" "}
                                        {formatTime(duration)}
                                    </span>

                                    <div className="flex items-center space-x-2">
                                        <Volume2 className="h-4 w-4 text-gray-600" />
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={volume}
                                            onChange={(e) =>
                                                handleVolumeChange(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-20"
                                        />
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Editing Controls */}
                    <div className="space-y-6">
                        {/* Video Settings */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Video Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={videoTitle}
                                        onChange={(e) =>
                                            setVideoTitle(e.target.value)
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={videoDescription}
                                        onChange={(e) =>
                                            setVideoDescription(e.target.value)
                                        }
                                        rows={3}
                                        placeholder="Add a description for your video..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">
                                            Allow Downloads
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Let viewers download this video
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setDownloadEnabled(!downloadEnabled)
                                        }
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                            downloadEnabled
                                                ? "bg-blue-600"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                                downloadEnabled
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Trim Tool */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Scissors className="h-5 w-5 mr-2" />
                                Trim Video
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time: {formatTime(trimStart)}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={trimStart}
                                        onChange={(e) =>
                                            setTrimStart(Number(e.target.value))
                                        }
                                        disabled={!duration || duration === 0}
                                        className="w-full disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time: {formatTime(trimEnd)}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={trimEnd}
                                        onChange={(e) =>
                                            setTrimEnd(Number(e.target.value))
                                        }
                                        disabled={!duration || duration === 0}
                                        className="w-full disabled:opacity-50"
                                    />
                                </div>
                                <p className="text-sm text-gray-600">
                                    Final duration:{" "}
                                    {duration && trimEnd > trimStart
                                        ? formatTime(trimEnd - trimStart)
                                        : "00:00"}
                                </p>
                            </div>
                        </div>

                        {/* Captions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Type className="h-5 w-5 mr-2" />
                                Captions
                            </h3>

                            {!hasCaptions ? (
                                <div className="text-center">
                                    <p className="text-gray-600 mb-4">
                                        Generate automatic captions using AI
                                    </p>
                                    <button
                                        onClick={generateCaptions}
                                        disabled={isGeneratingCaptions}
                                        className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 mx-auto"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        {isGeneratingCaptions
                                            ? "Generating..."
                                            : "Generate Captions"}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="bg-green-50 text-green-800 px-3 py-2 rounded-lg mb-4">
                                        ✓ Captions generated successfully
                                    </div>
                                    <button className="text-purple-600 hover:text-purple-700 font-medium">
                                        Edit Captions
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Export Options */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Export
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download MP4
                                </button>
                                <button className="w-full flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload to Cloud
                                </button>
                            </div>
                        </div>
                    </div>
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
                                {/* Copy Link */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Share Link
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={getVideoShareUrl()}
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

                                {/* Social Media Buttons */}
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
            </div>
        </div>
    );
}
