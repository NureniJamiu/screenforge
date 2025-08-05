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
        navigate('/dashboard/edit/temp-id');
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
    if (mediaRecorderRef.current) {
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
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create New Recording</h1>
        <p className="text-gray-600">
          Choose your recording mode and settings, then start capturing your screen
        </p>
      </div>

      {!isRecording ? (
        <>
          {/* Recording Mode Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recording Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { mode: 'tab' as RecordingMode, title: 'Browser Tab', description: 'Record a specific browser tab' },
                { mode: 'window' as RecordingMode, title: 'Application Window', description: 'Record a specific application window' },
                { mode: 'desktop' as RecordingMode, title: 'Entire Desktop', description: 'Record your entire desktop screen' }
              ].map((option) => (
                <button
                  key={option.mode}
                  onClick={() => setRecordingMode(option.mode)}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-150 ${
                    recordingMode === option.mode
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-semibold mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Volume2 className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">System Audio</h3>
                    <p className="text-sm text-gray-600">Record audio from your computer</p>
                  </div>
                </div>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    audioEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      audioEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mic className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Microphone</h3>
                    <p className="text-sm text-gray-600">Record audio from your microphone</p>
                  </div>
                </div>
                <button
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    micEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      micEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Start Recording */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Record</h2>
              <p className="text-gray-600 mb-6">
                All settings configured. Click the button below to start recording your screen.
              </p>
              <button
                onClick={startRecording}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-150 font-semibold text-lg flex items-center mx-auto shadow-lg hover:shadow-xl"
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
                <div className={`w-8 h-8 bg-red-500 rounded-full ${isRecording && !isPaused ? 'animate-pulse' : ''}`} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {isPaused ? 'Recording Paused' : 'Recording in Progress'}
              </h2>
              <div className="text-4xl font-mono text-red-600 font-bold mb-2">
                {formatTime(recordingTime)}
              </div>
              <p className="text-gray-600">
                {isPaused ? 'Click Resume to continue recording' : 'Your screen is being recorded'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-8">
              <button
                onClick={pauseRecording}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-all duration-150 font-medium flex items-center shadow-md"
              >
                {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={stopRecording}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-150 font-medium flex items-center shadow-md"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center text-gray-700">
                  {audioEnabled ? <Volume2 className="h-4 w-4 mr-2 text-green-600" /> : <VolumeX className="h-4 w-4 mr-2 text-gray-400" />}
                  <span className="font-medium">System Audio:</span>
                  <span className={`ml-1 ${audioEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {audioEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  {micEnabled ? <Mic className="h-4 w-4 mr-2 text-green-600" /> : <MicOff className="h-4 w-4 mr-2 text-gray-400" />}
                  <span className="font-medium">Microphone:</span>
                  <span className={`ml-1 ${micEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {micEnabled ? 'ON' : 'OFF'}
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
