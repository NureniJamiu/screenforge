import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Square, Play, Pause,
  Camera, Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';

type RecordingMode = 'tab' | 'window' | 'desktop';

export function RecordScreen() {
  const navigate = useNavigate();
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('tab');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const displayConstraints = {
        video: {
          mediaSource: recordingMode === 'desktop' ? 'screen' : 'window'
        },
        audio: audioEnabled
      } as any;

      const displayStream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);

      let finalStream = displayStream;

      // Add microphone if enabled
      if (micEnabled) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTracks = audioStream.getAudioTracks();
        audioTracks.forEach(track => finalStream.addTrack(track));
      }

      streamRef.current = finalStream;

      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Here you would upload the blob to your server
        console.log('Recording finished, blob size:', blob.size);

        // Create a temporary URL for preview (in real app, this would be handled by backend)
        URL.createObjectURL(blob);
        // In a real app, you'd save this to your backend and get a video ID
        navigate('/edit/temp-id');
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      intervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please make sure you grant permission to record your screen.');
    }
  }, [recordingMode, audioEnabled, micEnabled, navigate]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
    }
  }, [isRecording]);

  const recordingModes = [
    {
      id: 'tab' as const,
      title: 'Browser Tab',
      description: 'Record a specific browser tab',
      icon: '🌐',
      recommended: true
    },
    {
      id: 'window' as const,
      title: 'Browser Window',
      description: 'Record entire browser window',
      icon: '🖥️',
      recommended: false
    },
    {
      id: 'desktop' as const,
      title: 'Full Desktop',
      description: 'Record your entire screen',
      icon: '🖨️',
      recommended: false
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Recording</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Choose your recording mode and settings, then start capturing your screen
        </p>
      </div>

      {!isRecording ? (
        <>
          {/* Start Recording */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ready to Record</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Click the button below to start recording your screen
              </p>
              <button
                onClick={startRecording}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg flex items-center mx-auto"
              >
                <Camera className="h-6 w-6 mr-2" />
                Start Recording
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Recording Controls */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className={`w-6 h-6 bg-red-500 rounded-full ${isRecording && !isPaused ? 'animate-pulse' : ''}`} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isPaused ? 'Recording Paused' : 'Recording in Progress'}
              </h2>
              <div className="text-3xl font-mono text-red-600 dark:text-red-400 mb-4">
                {formatTime(recordingTime)}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={pauseRecording}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center"
              >
                {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={stopRecording}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                {audioEnabled ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
                System Audio: {audioEnabled ? 'ON' : 'OFF'}
              </div>
              <div className="flex items-center">
                {micEnabled ? <Mic className="h-4 w-4 mr-1" /> : <MicOff className="h-4 w-4 mr-1" />}
                Microphone: {micEnabled ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
