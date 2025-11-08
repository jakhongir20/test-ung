import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useI18n } from '../i18n';
import { useProctorHeartbeat, useProctorRecordViolation, useModeratorSessionViolations, useProctorUploadChunk } from '../api/surveys';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface FaceMonitoringProps {
  isActive: boolean;
  sessionId: string; // Required for server communication
  userId?: string; // Add userId for proctor API
  onViolation: (violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched' | 'face_mismatch') => void;
  onTestTerminated: () => void;
  checkInterval?: number; // milliseconds between checks
  referenceDescriptor?: number[] | null; // Reference descriptor captured during verification
}

interface ViolationAlertProps {
  isOpen: boolean;
  violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched' | 'face_mismatch';
  attemptCount: number;
  maxAttempts: number;
  onClose: () => void;
}

// Map internal violation types to API violation types
type APIViolationType = 'no_face' | 'multiple_face' | 'one_face' | 'another_tab' | 'switch_tab' | 'error_netwrok';

const mapViolationTypeToAPI = (violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched' | 'face_mismatch'): APIViolationType => {
  switch (violationType) {
    case 'no_face':
      return 'no_face';
    case 'multiple_faces':
      return 'multiple_face';
    case 'face_lost':
      return 'no_face'; // Face lost is treated as no face
    case 'tab_switched':
      return 'switch_tab';
    case 'face_mismatch':
      return 'one_face';
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

  useBodyScrollLock(isOpen);

  // Debug the values being passed to the alert
  console.log(`🔍 Face Monitoring Alert: isOpen=${isOpen}, violationType=${violationType}, attemptCount=${attemptCount}, maxAttempts=${maxAttempts}`);

  const isLastAttempt = attemptCount >= maxAttempts;
  const autoCloseSeconds = 5;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(autoCloseSeconds);

  useEffect(() => {
    if (!isOpen || isLastAttempt) return;

    setRemainingSeconds(autoCloseSeconds);

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseSeconds * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isOpen, isLastAttempt, onClose]);

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
      case 'face_mismatch':
        message = t('faceMonitoring.faceMismatch');
        break;
      default:
        message = t('faceMonitoring.violationDetected');
    }

    return message;
  };

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

          {!isLastAttempt && (
            <div className="text-center text-sm text-gray-600">
              {t('faceMonitoring.autoCloseCountdown', { seconds: remainingSeconds })}
            </div>
          )}
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
  checkInterval = 1500, // default to 1.5 seconds for faster detection cadence
  referenceDescriptor
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkNumberRef = useRef<number>(0);
  const currentChunkStartTimeRef = useRef<number>(0);
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const hiddenMonitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveNoFaceCountRef = useRef<number>(0);
  const consecutiveMultipleFacesCountRef = useRef<number>(0);
  const consecutiveGoodDetectionsRef = useRef<number>(0);
  const consecutiveMismatchCountRef = useRef<number>(0);
  const referenceDescriptorRef = useRef<Float32Array | null>(null);

  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [currentViolationType, setCurrentViolationType] = useState<'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched' | 'face_mismatch'>('no_face');
  const [lastViolationTime, setLastViolationTime] = useState<number>(0);

  const maxViolations = 3;
  const violationCooldown = 1500; // shorter cooldown between violations for faster feedback
  const hiddenTabCheckInterval = 1500; // how often to re-check hidden tab violations
  const faceMismatchThreshold = 0.58; // Euclidean distance threshold for face mismatch detection

  // Proctor API hooks
  const proctorHeartbeat = useProctorHeartbeat();
  const proctorRecordViolation = useProctorRecordViolation();
  const proctorUploadChunk = useProctorUploadChunk();
  const violationCountQuery = useModeratorSessionViolations(sessionId);
  const serverViolationCount = (violationCountQuery.data as { violation_count?: number; })?.violation_count || 0;
  const shouldTerminate = (violationCountQuery.data as { should_terminate?: boolean; })?.should_terminate || false;

  // Apply reference descriptor from verification (if available)
  useEffect(() => {
    if (referenceDescriptor && referenceDescriptor.length > 0) {
      referenceDescriptorRef.current = new Float32Array(referenceDescriptor);
      console.log('🆔 Face Monitoring: Loaded reference face descriptor from verification flow');
    }
  }, [referenceDescriptor]);

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
  const uploadVideoChunk = useCallback((videoBlob: Blob, chunkStartTime: number, chunkEndTime: number, mimeType?: string) => {
    if (!sessionId || videoBlob.size === 0) return;

    const chunkNumber = chunkNumberRef.current;
    // Reserve the next chunk number immediately to prevent duplicate numbers
    // if the recorder emits data faster than the upload completes.
    chunkNumberRef.current += 1;
    const chunkDuration = (chunkEndTime - chunkStartTime) / 1000; // Convert to seconds
    const video = videoRef.current;

    // Get video metadata
    const resolution = video ? `${video.videoWidth}x${video.videoHeight}` : '640x480';
    const hasAudio = (streamRef.current?.getAudioTracks().length ?? 0) > 0;

    uploadQueueRef.current = uploadQueueRef.current.then(async () => {
      const normalizedMimeType = (mimeType || videoBlob.type || 'video/webm').includes('webm')
        ? 'video/webm'
        : mimeType || videoBlob.type || 'video/webm';
      const chunkFile = new File([videoBlob], `chunk-${chunkNumber}.webm`, { type: normalizedMimeType });

      try {
        await proctorUploadChunk.mutateAsync({
          data: {
            session_id: sessionId,
            chunk_number: chunkNumber,
            video_chunk: chunkFile,
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
          duration: `${chunkDuration.toFixed(2)}s`,
          resolution,
          startTime: new Date(chunkStartTime).toISOString(),
          endTime: new Date(chunkEndTime).toISOString(),
          mimeType: normalizedMimeType,
        });
      } catch (error) {
        console.log('❌ Face Monitoring: Failed to upload chunk:', error);
      }
    });
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

      // Try different WebM codecs in order of preference.
      // We avoid MP4 containers because the backend expects WebM chunks and FFmpeg will fail otherwise.
      const codecs = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      let selectedMimeType = '';

      for (const codec of codecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
          selectedMimeType = codec;
          break;
        }
      }

      if (!selectedMimeType) {
        console.log('⚠️ Face Monitoring: No supported WebM codec found. Video recording will not start.');
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

          uploadVideoChunk(event.data, chunkStartTime, chunkEndTime, selectedMimeType);

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

  type FaceDetectionResult = {
    faceCount: number;
    confidence: number;
    descriptor?: Float32Array | null;
  };

  const detectFace = useCallback(async (): Promise<FaceDetectionResult | null> => {
    if (!videoRef.current || !isModelsLoaded) return null;

    try {
      const detections = await faceapi
        .detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320, // Larger input size for better detection
            scoreThreshold: 0.4 // Lower threshold to detect faces at angles
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      // Log detailed face detection data for server communication
      console.log('📊 Face Detection Data:', {
        timestamp: new Date().toISOString(),
        faceCount: detections.length,
        detections: detections.map(detection => ({
          confidence: detection.detection.score,
          box: {
            x: detection.detection.box.x,
            y: detection.detection.box.y,
            width: detection.detection.box.width,
            height: detection.detection.box.height
          },
          hasDescriptor: !!detection.descriptor
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
              confidence_score: detections.length > 0 ? detections[0].detection.score : 0,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.log('❌ Face Monitoring: Failed to send heartbeat:', error);
        }
      }

      return {
        faceCount: detections.length,
        confidence: detections.length > 0 ? detections[0].detection.score : 0,
        descriptor: detections.length === 1 ? detections[0].descriptor : null
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

    // Only record violation if on test page
    const isOnTestPage = window.location.pathname.includes('test');
    if (!isOnTestPage) {
      console.log('⚠️ Face Monitoring: Not on test page, skipping violation recording');
      return;
    }

    if (!showViolationAlert) {
      setCurrentViolationType('tab_switched');
      setShowViolationAlert(true);
    } else {
      setCurrentViolationType('tab_switched');
    }
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

  const startHiddenMonitor = useCallback(() => {
    if (hiddenMonitorIntervalRef.current) return;
    hiddenMonitorIntervalRef.current = setInterval(() => {
      handleTabSwitch();
    }, hiddenTabCheckInterval);
  }, [handleTabSwitch, hiddenTabCheckInterval]);

  const stopHiddenMonitor = useCallback(() => {
    if (hiddenMonitorIntervalRef.current) {
      clearInterval(hiddenMonitorIntervalRef.current);
      hiddenMonitorIntervalRef.current = null;
    }
  }, []);

  const handleViolation = useCallback(async (violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'face_mismatch', detectionData?: { faceCount?: number; confidence?: number; descriptorDistance?: number; }) => {
    const now = Date.now();

    // Check cooldown period
    if (now - lastViolationTime < violationCooldown) {
      return;
    }

    // Only record violation if on test page
    const isOnTestPage = window.location.pathname.includes('test');
    if (!isOnTestPage) {
      console.log('⚠️ Face Monitoring: Not on test page, skipping violation recording');
      return;
    }

    if (!showViolationAlert || currentViolationType !== violationType) {
      setCurrentViolationType(violationType);
      if (!showViolationAlert) {
        setShowViolationAlert(true);
      }
    }
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
  }, [sessionId, lastViolationTime, violationCooldown, showViolationAlert, currentViolationType, proctorRecordViolation, onViolation, captureSnapshot]);

  const startMonitoring = useCallback(() => {
    if (!isActive || !isModelsLoaded) return;

    setIsMonitoring(true);

    // Reset consecutive detection counters when starting monitoring
    consecutiveNoFaceCountRef.current = 0;
    consecutiveMultipleFacesCountRef.current = 0;
    consecutiveGoodDetectionsRef.current = 0;
    consecutiveMismatchCountRef.current = 0;

    // Start video recording
    startVideoRecording();

    const processDetection = async () => {
      const detectionResult = await detectFace();

      if (detectionResult === null) {
        // Detection failed (error occurred)
        consecutiveNoFaceCountRef.current++;
        consecutiveMultipleFacesCountRef.current = 0; // Reset multiple faces counter
        consecutiveGoodDetectionsRef.current = 0; // Reset good detection counter

        // Only trigger violation after 3 consecutive failures
        if (consecutiveNoFaceCountRef.current >= 3) {
          handleViolation('face_lost', { faceCount: 0, confidence: 0 });
          consecutiveNoFaceCountRef.current = 0; // Reset after violation
        }
        return;
      }

      if (detectionResult.faceCount === 0) {
        // No face detected - increment counter
        consecutiveNoFaceCountRef.current++;
        consecutiveMultipleFacesCountRef.current = 0; // Reset multiple faces counter
        consecutiveGoodDetectionsRef.current = 0; // Reset good detection counter

        // Only trigger violation after 3 consecutive failures
        if (consecutiveNoFaceCountRef.current >= 3) {
          handleViolation('no_face', { faceCount: 0, confidence: 0 });
          consecutiveNoFaceCountRef.current = 0; // Reset after violation
        }
        return;
      }

      if (detectionResult.faceCount > 1) {
        // Multiple faces detected - increment counter
        consecutiveMultipleFacesCountRef.current++;
        consecutiveNoFaceCountRef.current = 0; // Reset no face counter
        consecutiveGoodDetectionsRef.current = 0; // Reset good detection counter

        // Only trigger violation after 3 consecutive failures
        if (consecutiveMultipleFacesCountRef.current >= 3) {
          handleViolation('multiple_faces', {
            faceCount: detectionResult.faceCount,
            confidence: detectionResult.confidence
          });
          consecutiveMultipleFacesCountRef.current = 0; // Reset after violation
        }
        return;
      }

      // Exactly one face detected - evaluate identity
      consecutiveNoFaceCountRef.current = 0;
      consecutiveMultipleFacesCountRef.current = 0;
      const descriptor = detectionResult.descriptor;

      if (descriptor) {
        if (!referenceDescriptorRef.current) {
          referenceDescriptorRef.current = descriptor;
          console.log('🎯 Face Monitoring: Reference face descriptor captured for identity validation');
        } else {
          const reference = referenceDescriptorRef.current;
          const distance = faceapi.euclideanDistance(Array.from(reference), Array.from(descriptor));
          console.log(`🆔 Face Monitoring: Descriptor distance ${distance.toFixed(4)} (threshold ${faceMismatchThreshold})`);

          if (distance > faceMismatchThreshold) {
            consecutiveMismatchCountRef.current++;
            consecutiveGoodDetectionsRef.current = 0;

            if (consecutiveMismatchCountRef.current >= 2) {
              handleViolation('face_mismatch', {
                faceCount: detectionResult.faceCount,
                confidence: detectionResult.confidence,
                descriptorDistance: distance
              });
              consecutiveMismatchCountRef.current = 0;
            }
            return;
          }
        }
      }

      // Good detection of the verified user - reset violation counters
      consecutiveMismatchCountRef.current = 0;
      consecutiveGoodDetectionsRef.current++;
    };

    // Start periodic face detection
    intervalRef.current = setInterval(processDetection, checkInterval);
    // Run immediately for quicker feedback
    processDetection();

  }, [isActive, isModelsLoaded, detectFace, checkInterval, handleViolation, startVideoRecording]);

  useEffect(() => {
    if (!isActive) {
      stopHiddenMonitor();
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
        startHiddenMonitor();
      } else {
        stopHiddenMonitor();
      }
    };

    const handleWindowBlur = () => {
      if (isActive) {
        handleTabSwitch();
        startHiddenMonitor();
      }
    };

    const handleWindowFocus = () => {
      stopHiddenMonitor();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isActive, handleTabSwitch, startHiddenMonitor, stopHiddenMonitor]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop video recording
    stopVideoRecording();
    stopHiddenMonitor();

    setIsMonitoring(false);

  }, [stopVideoRecording, stopHiddenMonitor]);

  const handleViolationAlertClose = useCallback(() => {
    setShowViolationAlert(false);

    // Server will handle termination logic

  }, []);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
      stopVideoRecording();
      stopHiddenMonitor();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Reset chunk counter on unmount (session ended)
      chunkNumberRef.current = 0;
      currentChunkStartTimeRef.current = 0;
    };
  }, [stopMonitoring, stopVideoRecording, stopHiddenMonitor]);

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
