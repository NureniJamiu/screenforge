import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, Save, Share2,
  Scissors, Type, Volume2, Download,
  ChevronLeft, Upload, Sparkles
} from 'lucide-react';

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

  // Mock video data - in real app this would come from API
  const videoSrc = '/api/placeholder/800/450'; // This would be the actual video URL

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setTrimEnd(video.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, []);

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
    // Here you would save the video with all edits to the backend
    console.log('Saving video with settings:', {
      videoId,
      title: videoTitle,
      trimStart,
      trimEnd,
      downloadEnabled,
      hasCaptions
    });

    // Simulate save
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleShare = () => {
    // Navigate to share view
    navigate(`/video/temp-share-token`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Editor</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleShare}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button
            onClick={handleSave}
            className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full h-full"
                poster="/api/placeholder/800/450"
                controls={false}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Controls */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </button>

                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-sm text-gray-600 dark:text-gray-300 min-w-max">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editing Panel */}
        <div className="space-y-6">
          {/* Video Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Video Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Downloads</span>
                <button
                  onClick={() => setDownloadEnabled(!downloadEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    downloadEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      downloadEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Trim Tool */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Scissors className="h-5 w-5 mr-2" />
              Trim Video
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time: {formatTime(trimStart)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={trimStart}
                  onChange={(e) => setTrimStart(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time: {formatTime(trimEnd)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="text-sm text-gray-600">
                Final Duration: {formatTime(trimEnd - trimStart)}
              </div>
            </div>
          </div>

          {/* AI Captions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Type className="h-5 w-5 mr-2" />
              AI Captions
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
                  {isGeneratingCaptions ? 'Generating...' : 'Generate Captions'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export</h3>
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
  );
}
