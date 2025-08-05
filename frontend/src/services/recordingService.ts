import type { RecordingConfig } from '../types/recording';

export interface RecordingResult {
  blob: Blob;
  duration: number;
  size: number;
  mimeType: string;
}

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private onDataAvailable?: (chunk: Blob) => void;
  private onStop?: (result: RecordingResult) => void;
  private onError?: (error: Error) => void;

  async startRecording(config: RecordingConfig): Promise<void> {
    try {
      this.chunks = [];
      this.startTime = Date.now();

      // Configure display stream constraints based on recording mode
      const displayConstraints = this.getDisplayConstraints(config);

      // Get display stream
      const displayStream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);

      // Combine with microphone audio if enabled
      const finalStream = await this.combineStreams(displayStream, config);

      this.stream = finalStream;

      // Create MediaRecorder with optimal settings
      const mediaRecorder = this.createMediaRecorder(finalStream, config);
      this.mediaRecorder = mediaRecorder;

      // Set up event handlers
      this.setupEventHandlers();

      // Start recording
      mediaRecorder.start(1000); // Collect data every second for progressive upload

    } catch (error) {
      throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  getRecordingState(): RecordingState {
    if (!this.mediaRecorder) return 'inactive';
    return this.mediaRecorder.state as RecordingState;
  }

  onDataChunk(callback: (chunk: Blob) => void): void {
    this.onDataAvailable = callback;
  }

  onRecordingComplete(callback: (result: RecordingResult) => void): void {
    this.onStop = callback;
  }

  onRecordingError(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  private getDisplayConstraints(config: RecordingConfig): MediaStreamConstraints {
    const videoConstraints: MediaTrackConstraints = {
      // Note: mediaSource is not a standard property, using displaySurface instead
      displaySurface: config.mode === 'desktop' ? 'monitor' : config.mode === 'window' ? 'window' : 'browser',
    };

    // Set quality constraints
    switch (config.quality) {
      case 'ultra':
        Object.assign(videoConstraints, {
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60 }
        });
        break;
      case 'high':
        Object.assign(videoConstraints, {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        });
        break;
      default: // standard
        Object.assign(videoConstraints, {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        });
    }

    return {
      video: videoConstraints,
      audio: config.audioEnabled
    };
  }

  private async combineStreams(displayStream: MediaStream, config: RecordingConfig): Promise<MediaStream> {
    if (!config.micEnabled) {
      return displayStream;
    }

    try {
      // Get microphone stream
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create new stream with display video and both audio tracks
      const combinedStream = new MediaStream();

      // Add video tracks from display
      displayStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      // Add audio tracks from both sources
      displayStream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      micStream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      return combinedStream;
    } catch (error) {
      console.warn('Failed to access microphone, continuing with system audio only:', error);
      return displayStream;
    }
  }

  private createMediaRecorder(stream: MediaStream, config: RecordingConfig): MediaRecorder {
    // Try different codecs in order of preference
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ];

    let mimeType = 'video/webm';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    // Set bitrate based on quality
    const videoBitsPerSecond = this.getVideoBitrate(config.quality);
    const audioBitsPerSecond = 128000; // 128 kbps for audio

    return new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond,
      audioBitsPerSecond
    });
  }

  private getVideoBitrate(quality: string): number {
    switch (quality) {
      case 'ultra': return 8000000; // 8 Mbps
      case 'high': return 4000000;  // 4 Mbps
      default: return 2000000;      // 2 Mbps
    }
  }

  private setupEventHandlers(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
        this.onDataAvailable?.(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, {
        type: this.mediaRecorder?.mimeType || 'video/webm'
      });

      const duration = (Date.now() - this.startTime) / 1000;

      const result: RecordingResult = {
        blob,
        duration,
        size: blob.size,
        mimeType: blob.type
      };

      this.onStop?.(result);
    };

    this.mediaRecorder.onerror = (event) => {
      const error = new Error(`Recording error: ${event.error || 'Unknown error'}`);
      this.onError?.(error);
    };

    // Handle stream ending (user stops sharing)
    if (this.stream) {
      this.stream.getVideoTracks().forEach(track => {
        track.onended = () => {
          this.stopRecording();
        };
      });
    }
  }
}

type RecordingState = 'inactive' | 'recording' | 'paused';

// Utility function to check browser support
export function checkRecordingSupport(): {
  supported: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!navigator.mediaDevices) {
    missing.push('MediaDevices API');
  }

  if (!navigator.mediaDevices?.getDisplayMedia) {
    missing.push('Screen Capture API');
  }

  if (!window.MediaRecorder) {
    missing.push('MediaRecorder API');
  }

  return {
    supported: missing.length === 0,
    missing
  };
}

// Utility function to estimate file size
export function estimateFileSize(durationSeconds: number, quality: string): number {
  const bitrate = quality === 'ultra' ? 8000000 : quality === 'high' ? 4000000 : 2000000;
  return (bitrate * durationSeconds) / 8; // Convert bits to bytes
}
