import { useState, useRef, useCallback } from 'react';
import { RecordingService, checkRecordingSupport } from '../services/recordingService';
import { AuthenticatedVideoUploadService } from '../services/authenticatedVideoUploadService';
import type { RecordingResult } from '../services/recordingService';
import type { RecordingConfig, VideoUploadProgress, ProcessedVideo } from '../types/recording';

interface UseRecordingOptions {
  onRecordingComplete?: (video: ProcessedVideo) => void;
  onError?: (error: string) => void;
  enableLiveUpload?: boolean;
  getAuthToken?: () => Promise<string | null>;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  isProcessing: boolean;
  uploadProgress: VideoUploadProgress | null;
  error: string | null;
  browserSupport: { supported: boolean; missing: string[] };
  isUploading: boolean;
}

export function useRecording(options: UseRecordingOptions = {}) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    isProcessing: false,
    uploadProgress: null,
    error: null,
    browserSupport: checkRecordingSupport(),
    isUploading: false
  });

  const recordingServiceRef = useRef<RecordingService | null>(null);
  const uploadServiceRef = useRef<AuthenticatedVideoUploadService>(new AuthenticatedVideoUploadService());
  const intervalRef = useRef<number | null>(null);
  const liveSessionRef = useRef<string | null>(null);
  const chunkCounterRef = useRef<number>(0);

  const updateState = useCallback((updates: Partial<RecordingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setError = useCallback((error: string | null) => {
    updateState({ error });
    if (error && options.onError) {
      options.onError(error);
    }
  }, [options.onError, updateState]);

  const startTimer = useCallback(() => {
    intervalRef.current = window.setInterval(() => {
      setState(prev => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async (config: RecordingConfig) => {
    try {
      setError(null);

      if (!state.browserSupport.supported) {
        setError(`Recording not supported: ${state.browserSupport.missing.join(', ')}`);
        return;
      }

      const recordingService = new RecordingService();
      recordingServiceRef.current = recordingService;

      // Initialize live session if enabled
      if (options.enableLiveUpload) {
        try {
          const token = await options.getAuthToken?.();
          if (!token) {
            throw new Error('Authentication required for live upload');
          }

          const sessionId = await uploadServiceRef.current.startLiveSession({
            title: `Live Recording ${new Date().toLocaleDateString()}`,
            recordingType: config.mode.toUpperCase(),
          }, token);
          liveSessionRef.current = sessionId;
          chunkCounterRef.current = 0;
        } catch (error) {
          console.warn(
              "Failed to start live session, falling back to regular upload:",
              error
          );
        }
      }

      // Set up event handlers
      recordingService.onRecordingComplete(async (result: RecordingResult) => {
        updateState({ isRecording: false, isPaused: false, isProcessing: true });
        stopTimer();

        try {
          let processedVideo: ProcessedVideo;

          if (liveSessionRef.current) {
            // Finalize live session with auth token
            const token = await options.getAuthToken?.();
            if (!token) {
              throw new Error('Authentication required for live upload');
            }
            processedVideo = await uploadServiceRef.current.finalizeLiveSession(liveSessionRef.current, token);
          } else {
            // Regular upload with auth token
            updateState({ isUploading: true });
            const token = await options.getAuthToken?.();
            if (!token) {
              throw new Error('Authentication required for upload');
            }
            const metadata = {
              title: `Recording ${new Date().toLocaleDateString()}`,
              description: `Screen recording captured on ${new Date().toLocaleString()}`,
              recordingType: config.mode.toUpperCase(),
              duration: result.duration,
              isDownloadable: true
            };
            processedVideo = await uploadServiceRef.current.uploadVideo(
              result.blob,
              metadata,
              token,
              (progress) => updateState({ uploadProgress: progress })
            );
          }

          updateState({
            isProcessing: false,
            isUploading: false,
            uploadProgress: null,
            recordingTime: 0
          });

          if (options.onRecordingComplete) {
            options.onRecordingComplete(processedVideo);
          }
        } catch (uploadError) {
          updateState({
            isProcessing: false,
            isUploading: false,
            uploadProgress: null
          });

          // Check if error is due to cancellation
          if (uploadError instanceof Error && uploadError.message.includes('cancelled')) {
            setError('Upload cancelled');
          } else {
            setError(`Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        }
      });

      recordingService.onRecordingError((recordingError) => {
        setError(`Recording failed: ${recordingError.message}`);
        updateState({ isRecording: false, isPaused: false });
        stopTimer();
      });

      // Handle live chunk uploads
      if (options.enableLiveUpload && liveSessionRef.current) {
        recordingService.onDataChunk(async (chunk) => {
          try {
            // Live chunk upload with auth token
            const token = await options.getAuthToken?.();
            if (!token) {
              throw new Error('Authentication required for live chunk upload');
            }
            await uploadServiceRef.current.uploadRecordingChunk(
              chunk,
              liveSessionRef.current!,
              chunkCounterRef.current++,
              token
            );
          } catch (error) {
            console.warn('Failed to upload live chunk:', error);
          }
        });
      }

      await recordingService.startRecording(config);
      updateState({ isRecording: true, recordingTime: 0 });
      startTimer();

    } catch (error) {
      setError(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [state.browserSupport, options.onRecordingComplete, options.onError, options.enableLiveUpload, setError, updateState, startTimer, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (recordingServiceRef.current && state.isRecording) {
      if (state.isPaused) {
        recordingServiceRef.current.resumeRecording();
        startTimer();
      } else {
        recordingServiceRef.current.pauseRecording();
        stopTimer();
      }
      updateState({ isPaused: !state.isPaused });
    }
  }, [state.isRecording, state.isPaused, startTimer, stopTimer, updateState]);

  const stopRecording = useCallback(() => {
    if (recordingServiceRef.current) {
      recordingServiceRef.current.stopRecording();
      stopTimer();
    }
  }, [stopTimer]);

  const cancelUpload = useCallback(() => {
    if (state.isUploading) {
      uploadServiceRef.current.cancelUpload();
      updateState({
        isProcessing: false,
        isUploading: false,
        uploadProgress: null
      });
    }
  }, [updateState, state.isUploading]);

  const cancelRecording = useCallback(() => {
    if (recordingServiceRef.current) {
      recordingServiceRef.current.stopRecording();
      stopTimer();
    }

    // Clean up live session if exists
    if (liveSessionRef.current) {
      // Note: In a real implementation, you might want to call cleanup API
      liveSessionRef.current = null;
    }

    updateState({
      isRecording: false,
      isPaused: false,
      recordingTime: 0,
      isProcessing: false,
      isUploading: false,
      uploadProgress: null
    });
  }, [stopTimer, updateState]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    actions: {
      startRecording,
      pauseRecording,
      stopRecording,
      cancelRecording,
      cancelUpload,
      clearError
    },
    utils: {
      formatTime
    }
  };
}
