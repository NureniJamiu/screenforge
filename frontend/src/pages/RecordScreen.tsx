import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Square,
    Play,
    Pause,
    Upload,
    AlertCircle,
    Camera,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Settings,
    X,
} from "lucide-react";
import { useRecording } from "../hooks/useRecording";
import type { RecordingMode } from "../types/recording";

export function RecordScreen() {
    const navigate = useNavigate();
    const [recordingMode, setRecordingMode] = useState<RecordingMode>("tab");
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(false);
    const [quality, setQuality] = useState<"standard" | "high" | "ultra">(
        "standard"
    );

    const recording = useRecording({
        onRecordingComplete: (video) => {
            // Navigate to video editor
            navigate(`/dashboard/edit/${video.id}`);
        },
        onError: (error) => {
            console.error("Recording error:", error);
        },
        enableLiveUpload: false, // Set to true for real-time upload
    });

    const handleStartRecording = async () => {
        const config = {
            mode: recordingMode,
            audioEnabled,
            micEnabled,
            quality,
        };

        await recording.actions.startRecording(config);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Create New Recording
                </h1>
                <p className="text-gray-600">
                    Choose your recording mode and settings, then start
                    capturing your screen
                </p>
            </div>

            {/* Error Display */}
            {recording.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">
                            Recording Error
                        </h3>
                        <p className="text-sm text-red-600 mt-1">
                            {recording.error}
                        </p>
                        <button
                            onClick={recording.actions.clearError}
                            className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Browser Support Warning */}
            {!recording.browserSupport.supported && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                                Browser Not Supported
                            </h3>
                            <p className="text-sm text-yellow-600 mt-1">
                                Your browser is missing:{" "}
                                {recording.browserSupport.missing.join(", ")}
                            </p>
                            <p className="text-sm text-yellow-600 mt-1">
                                Please use a modern browser like Chrome,
                                Firefox, or Safari.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {recording.isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Upload className="h-5 w-5 text-blue-500 mr-3" />
                            <h3 className="text-lg font-medium text-blue-900">
                                Processing Recording
                            </h3>
                        </div>
                        {recording.isUploading && (
                            <button
                                onClick={recording.actions.cancelUpload}
                                className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                title="Cancel upload"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                            </button>
                        )}
                    </div>

                    {recording.uploadProgress && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-blue-600">
                                <span>Uploading video...</span>
                                <span>
                                    {recording.uploadProgress.percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${recording.uploadProgress.percentage}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-blue-500">
                                {Math.round(
                                    recording.uploadProgress.loaded /
                                        1024 /
                                        1024
                                )}{" "}
                                MB of{" "}
                                {Math.round(
                                    recording.uploadProgress.total / 1024 / 1024
                                )}{" "}
                                MB
                            </p>
                        </div>
                    )}

                    {!recording.uploadProgress && (
                        <div className="flex items-center text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                            <span>Preparing upload...</span>
                        </div>
                    )}
                </div>
            )}

            {!recording.isRecording ? (
                <>
                    {/* Recording Mode Selection */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Recording Mode
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[
                                {
                                    mode: "tab" as RecordingMode,
                                    title: "Browser Tab",
                                    description:
                                        "Record a specific browser tab",
                                },
                                {
                                    mode: "window" as RecordingMode,
                                    title: "Application Window",
                                    description:
                                        "Record a specific application window",
                                },
                                {
                                    mode: "desktop" as RecordingMode,
                                    title: "Entire Desktop",
                                    description:
                                        "Record your entire desktop screen",
                                },
                            ].map((option) => (
                                <button
                                    key={option.mode}
                                    onClick={() =>
                                        setRecordingMode(option.mode)
                                    }
                                    className={`p-4 border-2 rounded-lg text-left transition-all duration-150 ${
                                        recordingMode === option.mode
                                            ? "border-blue-500 bg-blue-50 text-blue-900"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <h3 className="font-semibold mb-1">
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {option.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audio Settings */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Audio Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Volume2 className="h-5 w-5 text-gray-500 mr-3" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            System Audio
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Record audio from your computer
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        setAudioEnabled(!audioEnabled)
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                        audioEnabled
                                            ? "bg-blue-600"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                            audioEnabled
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Mic className="h-5 w-5 text-gray-500 mr-3" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Microphone
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Record audio from your microphone
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMicEnabled(!micEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                        micEnabled
                                            ? "bg-blue-600"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                            micEnabled
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quality Settings */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            Recording Quality
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    quality: "standard" as const,
                                    title: "Standard (720p)",
                                    description:
                                        "Good quality, smaller file size",
                                    bitrate: "2 Mbps",
                                },
                                {
                                    quality: "high" as const,
                                    title: "High (1080p)",
                                    description:
                                        "Better quality, larger file size",
                                    bitrate: "4 Mbps",
                                },
                                {
                                    quality: "ultra" as const,
                                    title: "Ultra (4K)",
                                    description:
                                        "Best quality, largest file size",
                                    bitrate: "8 Mbps",
                                },
                            ].map((option) => (
                                <button
                                    key={option.quality}
                                    onClick={() => setQuality(option.quality)}
                                    className={`p-4 border-2 rounded-lg text-left transition-all duration-150 ${
                                        quality === option.quality
                                            ? "border-blue-500 bg-blue-50 text-blue-900"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <h3 className="font-semibold mb-1">
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {option.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        ~{option.bitrate}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Recording */}
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Camera className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Ready to Record
                            </h2>
                            <p className="text-gray-600 mb-6">
                                All settings configured. Click the button below
                                to start recording your screen.
                            </p>
                            <button
                                onClick={handleStartRecording}
                                disabled={
                                    !recording.browserSupport.supported ||
                                    recording.isProcessing
                                }
                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-150 font-semibold text-lg flex items-center mx-auto shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse" />
                                Start Recording
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* Recording Controls */
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="text-center">
                        <div className="mb-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-300">
                                <div
                                    className={`w-8 h-8 bg-red-500 rounded-full ${
                                        recording.isRecording &&
                                        !recording.isPaused
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                                />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                {recording.isPaused
                                    ? "Recording Paused"
                                    : "Recording in Progress"}
                            </h2>
                            <div className="text-4xl font-mono text-red-600 font-bold mb-2">
                                {recording.utils.formatTime(
                                    recording.recordingTime
                                )}
                            </div>
                            <p className="text-gray-600">
                                {recording.isPaused
                                    ? "Click Resume to continue recording"
                                    : "Your screen is being recorded"}
                            </p>
                        </div>

                        <div className="flex items-center justify-center space-x-4 mb-8">
                            <button
                                onClick={recording.actions.pauseRecording}
                                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-all duration-150 font-medium flex items-center shadow-md"
                            >
                                {recording.isPaused ? (
                                    <Play className="h-5 w-5 mr-2" />
                                ) : (
                                    <Pause className="h-5 w-5 mr-2" />
                                )}
                                {recording.isPaused ? "Resume" : "Pause"}
                            </button>

                            <button
                                onClick={recording.actions.stopRecording}
                                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-150 font-medium flex items-center shadow-md"
                            >
                                <Square className="h-5 w-5 mr-2" />
                                Stop Recording
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-center space-x-8 text-sm">
                                <div className="flex items-center text-gray-700">
                                    {audioEnabled ? (
                                        <Volume2 className="h-4 w-4 mr-2 text-green-600" />
                                    ) : (
                                        <VolumeX className="h-4 w-4 mr-2 text-gray-400" />
                                    )}
                                    <span className="font-medium">
                                        System Audio:
                                    </span>
                                    <span
                                        className={`ml-1 ${
                                            audioEnabled
                                                ? "text-green-600"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {audioEnabled ? "ON" : "OFF"}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    {micEnabled ? (
                                        <Mic className="h-4 w-4 mr-2 text-green-600" />
                                    ) : (
                                        <MicOff className="h-4 w-4 mr-2 text-gray-400" />
                                    )}
                                    <span className="font-medium">
                                        Microphone:
                                    </span>
                                    <span
                                        className={`ml-1 ${
                                            micEnabled
                                                ? "text-green-600"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {micEnabled ? "ON" : "OFF"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
