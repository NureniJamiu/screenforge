import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, Save, Share2,
  Scissors, Type, Volume2, Download,
  ChevronLeft, Upload, Sparkles, Loader2
} from 'lucide-react';
import { VideoService } from '../services/videoService';
import type { ProcessedVideo } from '../types/recording';

export function VideoEditor() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [videoTitle, setVideoTitle] = useState('My Screen Recording');
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [hasCaptions, setHasCaptions] = useState(false);
  const [video, setVideo] = useState<ProcessedVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch video data
  useEffect(() => {
    if (!videoId) {
      setError('No video ID provided');
      setLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await VideoService.getVideo(videoId);
        setVideo(videoData);
        setVideoTitle(videoData.title);
        setDownloadEnabled(videoData.isDownloadable !== false);
        setError(null);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const videoSrc = video ? VideoService.getVideoUrl(video.videoUrl) : null;

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      const videoElement = videoRef.current;

      const handleLoadedMetadata = () => {
        setDuration(videoElement.duration);
        setTrimEnd(videoElement.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(videoElement.currentTime);
      };

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [videoSrc]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const generateCaptions = async () => {
    setIsGeneratingCaptions(true);
    // Simulate AI caption generation
    setTimeout(() => {
      setIsGeneratingCaptions(false);
      setHasCaptions(true);
    }, 3000);
  };

  const handleSave = async () => {
    if (!video) return;

    try {
      setSaving(true);

      // Update video metadata
      await VideoService.updateVideo(video.id, {
        title: videoTitle,
        isDownloadable: downloadEnabled,
      });

      // Here you would also handle trimming and other editing operations
      console.log("Saving video with settings:", {
        videoId,
        title: videoTitle,
        trimStart,
        trimEnd,
        downloadEnabled,
        hasCaptions,
      });

      // Navigate back to videos list or dashboard
      navigate('/dashboard/videos');
    } catch (err) {
      console.error('Error saving video:', err);
      setError(err instanceof Error ? err.message : 'Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (!video) return;

    // Navigate to sharing options
    navigate(`/dashboard/share/${video.id}`);
  };

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
          <p className="text-red-600 mb-4">{error || 'Video not found'}</p>
          <button
            onClick={() => navigate('/dashboard/videos')}
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
              onClick={() => navigate('/dashboard/videos')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Video Editor</h1>
              <p className="text-gray-600 mt-1">Edit and enhance your recording</p>
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
              {saving ? 'Saving...' : 'Save'}
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
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>

                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <span className="text-sm text-gray-600 min-w-max">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-gray-600" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
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
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    onClick={() => setDownloadEnabled(!downloadEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      downloadEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        downloadEnabled ? 'translate-x-6' : 'translate-x-1'
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
                    max={duration}
                    value={trimStart}
                    onChange={(e) => setTrimStart(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time: {formatTime(trimEnd)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Final duration: {formatTime(trimEnd - trimStart)}
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
                    {isGeneratingCaptions ? "Generating..." : "Generate Captions"}
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
      </div>
    </div>
  );
}
