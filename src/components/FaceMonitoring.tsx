import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useI18n } from '../i18n';
import { useProctorHeartbeat, useProctorRecordViolation, useModeratorSessionViolations, useProctorUploadChunk } from '../api/surveys';

interface FaceMonitoringProps {
  isActive: boolean;
  sessionId: string; // Required for server communication
  userId?: string; // Add userId for proctor API
  onViolation: (violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched') => void;
  onTestTerminated: () => void;
  checkInterval?: number; // milliseconds between checks
}

interface ViolationAlertProps {
  isOpen: boolean;
  violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched';
  attemptCount: number;
  maxAttempts: number;
  onClose: () => void;
}

// Map internal violation types to API violation types
type APIViolationType = 'no_face' | 'multiple_face' | 'one_face' | 'another_tab' | 'switch_tab' | 'error_netwrok';

const mapViolationTypeToAPI = (violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched'): APIViolationType => {
  switch (violationType) {
    case 'no_face':
      return 'no_face';
    case 'multiple_faces':
      return 'multiple_face';
    case 'face_lost':
      return 'no_face'; // Face lost is treated as no face
    case 'tab_switched':
      return 'switch_tab';
    default:
      return 'no_face';
  }
};

const ViolationAlert: FC<ViolationAlertProps> = ({
  isOpen,
  violationType,
  attemptCount,
  maxAttempts,
  onClose
}) => {
  const { t } = useI18n();

  // Debug the values being passed to the alert
  console.log(`🔍 Face Monitoring Alert: isOpen=${isOpen}, violationType=${violationType}, attemptCount=${attemptCount}, maxAttempts=${maxAttempts}`);

  if (!isOpen) return null;

  const getViolationMessage = () => {
    let message;
    switch (violationType) {
      case 'no_face':
        message = t('faceMonitoring.noFaceDetected');
        break;
      case 'multiple_faces':
        message = t('faceMonitoring.multipleFacesDetected');
        break;
      case 'face_lost':
        message = t('faceMonitoring.faceLost');
        break;
      case 'tab_switched':
        message = t('faceMonitoring.tabSwitched');
        break;
      default:
        message = t('faceMonitoring.violationDetected');
    }

    return message;
  };

  const isLastAttempt = attemptCount >= maxAttempts;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute w-full h-full inset-0 bg-red-500 bg-opacity-75 transition-opacity" />

      {/* Alert Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isLastAttempt ? t('faceMonitoring.testTerminated') : t('faceMonitoring.violationWarning')}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm font-medium">
              {getViolationMessage()}
            </p>
          </div>

          <div className="text-center">
            {/* <p className="text-gray-600 text-sm mb-2">
              {isLastAttempt
                ? t('faceMonitoring.maxAttemptsReached')
                : `${t('faceMonitoring.attemptsRemaining')}: ${attemptCount}/${maxAttempts}`
              }
            </p> */}

            {/* {!isLastAttempt && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(attemptCount / maxAttempts) * 100}%` }}
                ></div>
              </div>
            )} */}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${isLastAttempt
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            {isLastAttempt ? t('faceMonitoring.close') : t('faceMonitoring.continue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const FaceMonitoring: FC<FaceMonitoringProps> = ({
  isActive,
  sessionId,
  userId, // Add userId parameter
  onViolation,
  onTestTerminated,
  checkInterval = 10000 // 10 seconds default
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkNumberRef = useRef<number>(0);
  const currentChunkStartTimeRef = useRef<number>(0);

  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [currentViolationType, setCurrentViolationType] = useState<'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched'>('no_face');
  const [lastViolationTime, setLastViolationTime] = useState<number>(0);
  const [isPageVisible, setIsPageVisible] = useState(true);

  const maxViolations = 3;
  const violationCooldown = 5000; // 5 seconds cooldown between violations

  // Proctor API hooks
  const proctorHeartbeat = useProctorHeartbeat();
  const proctorRecordViolation = useProctorRecordViolation();
  const proctorUploadChunk = useProctorUploadChunk();
  const violationCountQuery = useModeratorSessionViolations(sessionId);
  const serverViolationCount = (violationCountQuery.data as { violation_count?: number; })?.violation_count || 0;
  const shouldTerminate = (violationCountQuery.data as { should_terminate?: boolean; })?.should_terminate || false;

  // Handle server-side termination
  useEffect(() => {
    if (shouldTerminate) {

      setIsMonitoring(false);
      onTestTerminated();
    }
  }, [shouldTerminate, onTestTerminated]);

  // Update violation alert when server count changes
  useEffect(() => {
    if (serverViolationCount > 0 && !showViolationAlert) {

      setShowViolationAlert(true);
    }
  }, [serverViolationCount, showViolationAlert]);

  // Page Visibility API detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;

      if (!isVisible && isPageVisible && isActive) {
        // Page became hidden while monitoring is active

        handleTabSwitch();
      }

      setIsPageVisible(isVisible);
    };

    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen for window focus/blur events for additional detection
    const handleWindowBlur = () => {
      if (isActive && isPageVisible) {

        handleTabSwitch();
      }
    };

    const handleWindowFocus = () => {

      setIsPageVisible(true);
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible, isActive]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);

        setIsModelsLoaded(true);

      } catch {
        /* Handle error silently */
      }
    };

    if (isActive) {
      loadModels();
    }
  }, [isActive]);

  // Initialize camera when monitoring starts
  useEffect(() => {
    const initializeCamera = async () => {
      if (!isActive || !isModelsLoaded) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            startMonitoring();
          };
        }
      } catch {
        // Don't show error to user, just log it
      }
    };

    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isModelsLoaded]);

  // Capture snapshot from video frame
  const captureSnapshot = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || !canvasRef.current) return null;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the full video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob || null);
        }, 'image/jpeg', 0.8);
      });
    } catch {
      return null;
    }
  }, []);

  // Upload video chunk to server
  const uploadVideoChunk = useCallback(async (videoBlob: Blob, chunkStartTime: number, chunkEndTime: number) => {
    if (!sessionId || videoBlob.size === 0) return;

    const chunkNumber = chunkNumberRef.current;
    const chunkDuration = (chunkEndTime - chunkStartTime) / 1000; // Convert to seconds
    const video = videoRef.current;

    // Get video metadata
    const resolution = video ? `${video.videoWidth}x${video.videoHeight}` : '640x480';
    const hasAudio = (streamRef.current?.getAudioTracks().length ?? 0) > 0;

    try {
      await proctorUploadChunk.mutateAsync({
        data: {
          session_id: sessionId,
          chunk_number: chunkNumber,
          video_chunk: videoBlob,
          duration_seconds: chunkDuration,
          start_time: chunkStartTime,
          end_time: chunkEndTime,
          has_audio: hasAudio,
          resolution: resolution,
          fps: 15, // Standard FPS for webcam
        },
      });

      console.log('✅ Face Monitoring: Chunk uploaded successfully', {
        chunkNumber,
        size: videoBlob.size,
        duration: chunkDuration.toFixed(2) + 's',
        resolution,
        startTime: new Date(chunkStartTime).toISOString(),
        endTime: new Date(chunkEndTime).toISOString(),
      });

      // Increment chunk number for next upload (never reset)
      chunkNumberRef.current += 1;
    } catch (error) {
      console.log('❌ Face Monitoring: Failed to upload chunk:', error);
    }
  }, [sessionId, proctorUploadChunk]);

  // Start video recording
  const startVideoRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) {
      console.log('⚠️ Face Monitoring: Stream not available for recording');
      return;
    }

    if (!window.MediaRecorder) {
      console.log('⚠️ Face Monitoring: MediaRecorder not supported');
      return;
    }

    try {
      // Only reset chunk number on first start (not on restarts)
      if (chunkNumberRef.current === 0) {
        currentChunkStartTimeRef.current = Date.now();
        console.log('✅ Face Monitoring: Starting new recording session, chunk number: 0');
      }

      // Try different codecs in order of preference
      const codecs = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
      let selectedMimeType = '';

      for (const codec of codecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
          selectedMimeType = codec;
          break;
        }
      }

      if (!selectedMimeType) {
        console.log('⚠️ Face Monitoring: No supported video codec found');
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event (fired every 10 seconds)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          const chunkStartTime = currentChunkStartTimeRef.current;
          const chunkEndTime = Date.now();

          console.log('📹 Face Monitoring: Video chunk ready, size:', event.data.size);

          uploadVideoChunk(event.data, chunkStartTime, chunkEndTime);

          // Update start time for next chunk
          currentChunkStartTimeRef.current = chunkEndTime;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.log('❌ Face Monitoring: MediaRecorder error:', event);
      };

      // Start recording with 10-second timeslice
      mediaRecorder.start(10000);
      console.log(`✅ Face Monitoring: Video recording started with ${selectedMimeType}`);
    } catch (error) {
      console.log('❌ Face Monitoring: Failed to start video recording:', error);
    }
  }, [uploadVideoChunk]);

  // Stop video recording
  const stopVideoRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      // Request final data before stopping
      mediaRecorder.requestData();

      // Stop after a brief delay to allow final data to be captured
      setTimeout(() => {
        mediaRecorder.stop();
        console.log('✅ Face Monitoring: Video recording stopped, total chunks:', chunkNumberRef.current);
      }, 100);
    }
    mediaRecorderRef.current = null;
    // Don't reset chunk number - it should continue throughout the session
    // chunkNumberRef.current will be reset only when component unmounts
  }, []);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !isModelsLoaded) return null;

    try {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      // Log detailed face detection data for server communication
      console.log('📊 Face Detection Data:', {
        timestamp: new Date().toISOString(),
        faceCount: detections.length,
        detections: detections.map(detection => ({
          confidence: detection.score,
          box: {
            x: detection.box.x,
            y: detection.box.y,
            width: detection.box.width,
            height: detection.box.height
          }
        })),
        videoDimensions: {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        }
      });

      // Send heartbeat to proctor API
      if (sessionId && userId) {
        try {
          await proctorHeartbeat.mutateAsync({
            data: {
              session_id: sessionId,
              face_count: detections.length,
              confidence_score: detections.length > 0 ? detections[0].score : 0,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.log('❌ Face Monitoring: Failed to send heartbeat:', error);
        }
      }

      return {
        faceCount: detections.length,
        confidence: detections.length > 0 ? detections[0].score : 0
      };
    } catch {
      console.log('❌ Face Monitoring: Face detection error occurred');
      return null;
    }
  }, [sessionId, userId, isModelsLoaded, proctorHeartbeat]);

  const handleTabSwitch = useCallback(async () => {
    const now = Date.now();

    // Check cooldown period
    if (now - lastViolationTime < violationCooldown) {
      return;
    }

    // Only handle violation if alert is not already showing
    if (showViolationAlert) {
      return;
    }

    // Only record violation if on test page
    const isOnTestPage = window.location.pathname.includes('test');
    if (!isOnTestPage) {
      console.log('⚠️ Face Monitoring: Not on test page, skipping violation recording');
      return;
    }

    setCurrentViolationType('tab_switched');
    setShowViolationAlert(true);
    setLastViolationTime(now);

    try {
      // Capture snapshot before reporting violation
      const snapshot = await captureSnapshot();

      // Report tab switch violation to proctor API
      if (sessionId) {
        await proctorRecordViolation.mutateAsync({
          data: {
            session_id: sessionId,
            violation_type: mapViolationTypeToAPI('tab_switched'),
            snapshot: snapshot || undefined,
            face_count: 0,
            confidence_score: 0,
          },
        });
      }
    } catch (error) {
      console.log('❌ Face Monitoring: Failed to report tab switch violation:', error);
    }

    onViolation('tab_switched');
  }, [sessionId, lastViolationTime, violationCooldown, showViolationAlert, proctorRecordViolation, onViolation, captureSnapshot]);

  const handleViolation = useCallback(async (violationType: 'no_face' | 'multiple_faces' | 'face_lost', detectionData?: { faceCount?: number; confidence?: number; }) => {
    const now = Date.now();

    // Check cooldown period
    if (now - lastViolationTime < violationCooldown) {
      return;
    }

    // Only handle violation if alert is not already showing
    if (showViolationAlert) {
      return;
    }

    // Only record violation if on test page
    const isOnTestPage = window.location.pathname.includes('test');
    if (!isOnTestPage) {
      console.log('⚠️ Face Monitoring: Not on test page, skipping violation recording');
      return;
    }

    setCurrentViolationType(violationType);
    setShowViolationAlert(true);
    setLastViolationTime(now);

    try {
      // Capture snapshot before reporting violation
      const snapshot = await captureSnapshot();

      // Report violation to proctor API
      if (sessionId) {
        await proctorRecordViolation.mutateAsync({
          data: {
            session_id: sessionId,
            violation_type: mapViolationTypeToAPI(violationType),
            snapshot: snapshot || undefined,
            face_count: detectionData?.faceCount ?? 0,
            confidence_score: detectionData?.confidence ?? 0,
          },
        });
      }
    } catch (error) {
      console.log('❌ Face Monitoring: Failed to report violation:', error);
    }

    onViolation(violationType);
  }, [sessionId, lastViolationTime, violationCooldown, showViolationAlert, proctorRecordViolation, onViolation, captureSnapshot]);

  const startMonitoring = useCallback(() => {
    if (!isActive || !isModelsLoaded) return;

    setIsMonitoring(true);

    // Start video recording
    startVideoRecording();

    // Start periodic face detection
    intervalRef.current = setInterval(async () => {
      const detectionResult = await detectFace();

      if (detectionResult === null) {
        // Detection failed, treat as violation
        handleViolation('face_lost', { faceCount: 0, confidence: 0 });
      } else if (detectionResult.faceCount === 0) {
        // No face detected
        handleViolation('no_face', { faceCount: 0, confidence: 0 });
      } else if (detectionResult.faceCount > 1) {
        // Multiple faces detected
        handleViolation('multiple_faces', {
          faceCount: detectionResult.faceCount,
          confidence: detectionResult.confidence
        });
      }
      // faceCount === 1 is good, no violation
    }, checkInterval);

  }, [isActive, isModelsLoaded, detectFace, checkInterval, handleViolation, startVideoRecording]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop video recording
    stopVideoRecording();

    setIsMonitoring(false);

  }, [stopVideoRecording]);

  const handleViolationAlertClose = useCallback(() => {
    setShowViolationAlert(false);

    // Server will handle termination logic

  }, []);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
      stopVideoRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Reset chunk counter on unmount (session ended)
      chunkNumberRef.current = 0;
      currentChunkStartTimeRef.current = 0;
    };
  }, [stopMonitoring, stopVideoRecording]);

  // Start/stop monitoring based on isActive
  useEffect(() => {
    if (isActive && isModelsLoaded && !isMonitoring) {
      startMonitoring();
    } else if (!isActive && isMonitoring) {
      stopMonitoring();
    }
  }, [isActive, isModelsLoaded, isMonitoring, startMonitoring, stopMonitoring]);

  return (
    <>
      {/* Hidden video element for face detection */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        muted
        playsInline
      />

      {/* Hidden canvas for snapshot capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Violation Alert */}
      <ViolationAlert
        isOpen={showViolationAlert}
        violationType={currentViolationType}
        attemptCount={serverViolationCount}
        maxAttempts={maxViolations}
        onClose={handleViolationAlertClose}
      />
    </>
  );
};
