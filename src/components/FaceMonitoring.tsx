import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useI18n } from '../i18n';
import { useReportViolation, useGetViolationCount } from '../api/surveys';

interface FaceMonitoringProps {
  isActive: boolean;
  sessionId: string; // Required for server communication
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

const ViolationAlert: FC<ViolationAlertProps> = ({
  isOpen,
  violationType,
  attemptCount,
  maxAttempts,
  onClose
}) => {
  const { t } = useI18n();

  // Debug the values being passed to the alert
  console.log(`ViolationAlert rendered: isOpen=${isOpen}, violationType=${violationType}, attemptCount=${attemptCount}, maxAttempts=${maxAttempts}`);

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
    console.log(`Violation message for ${violationType}:`, message);
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
            <p className="text-gray-600 text-sm mb-2">
              {isLastAttempt
                ? t('faceMonitoring.maxAttemptsReached')
                : `${t('faceMonitoring.attemptsRemaining')}: ${attemptCount}/${maxAttempts}`
              }
            </p>

            {!isLastAttempt && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(attemptCount / maxAttempts) * 100}%` }}
                ></div>
              </div>
            )}
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
  onViolation,
  onTestTerminated,
  checkInterval = 10000 // 10 seconds default
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [currentViolationType, setCurrentViolationType] = useState<'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched'>('no_face');
  const [lastViolationTime, setLastViolationTime] = useState<number>(0);
  const [isPageVisible, setIsPageVisible] = useState(true);

  const maxViolations = 3;
  const violationCooldown = 5000; // 5 seconds cooldown between violations

  // Server-side violation tracking
  const reportViolation = useReportViolation();
  const violationCountQuery = useGetViolationCount(sessionId);
  const serverViolationCount = (violationCountQuery.data as any)?.violation_count || 0;
  const shouldTerminate = (violationCountQuery.data as any)?.should_terminate || false;

  // Handle server-side termination
  useEffect(() => {
    if (shouldTerminate) {
      console.log('Server requested test termination due to violations');
      setIsMonitoring(false);
      onTestTerminated();
    }
  }, [shouldTerminate, onTestTerminated]);

  // Update violation alert when server count changes
  useEffect(() => {
    if (serverViolationCount > 0 && !showViolationAlert) {
      console.log(`Server violation count updated: ${serverViolationCount}`);
      setShowViolationAlert(true);
    }
  }, [serverViolationCount, showViolationAlert]);

  // Page Visibility API detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      console.log(`Page visibility changed: ${isVisible ? 'visible' : 'hidden'}`);

      if (!isVisible && isPageVisible && isActive) {
        // Page became hidden while monitoring is active
        console.log('Tab/window switched - triggering violation');
        handleTabSwitch();
      }

      setIsPageVisible(isVisible);
    };

    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen for window focus/blur events for additional detection
    const handleWindowBlur = () => {
      if (isActive && isPageVisible) {
        console.log('Window lost focus - triggering violation');
        handleTabSwitch();
      }
    };

    const handleWindowFocus = () => {
      console.log('Window gained focus');
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
        console.log('Face monitoring models loaded successfully');
      } catch (err) {
        console.error('Error loading face monitoring models:', err);
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
      } catch (err) {
        console.error('Error accessing camera for monitoring:', err);
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
  }, [isActive, isModelsLoaded]);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !isModelsLoaded) return null;

    try {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      // Log detailed face detection data for server communication
      const detectionData = {
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
      };

      console.log('Face Detection Data for Server:', JSON.stringify(detectionData, null, 2));

      return detections.length;
    } catch (err) {
      console.error('Face detection error during monitoring:', err);

      // Log error data for server
      const errorData = {
        timestamp: new Date().toISOString(),
        error: 'face_detection_failed',
        errorMessage: err instanceof Error ? err.message : 'Unknown error'
      };

      console.log('Face Detection Error Data for Server:', JSON.stringify(errorData, null, 2));

      return null;
    }
  }, [isModelsLoaded]);

  const handleTabSwitch = useCallback(async () => {
    const now = Date.now();

    // Check cooldown period
    if (now - lastViolationTime < violationCooldown) {
      console.log('Tab switch violation cooldown active, skipping');
      return;
    }

    // Only handle violation if alert is not already showing
    if (showViolationAlert) {
      console.log('Violation alert already showing, skipping tab switch violation');
      return;
    }

    setCurrentViolationType('tab_switched');
    setShowViolationAlert(true);
    setLastViolationTime(now);

    console.log('Reporting tab switch violation to server');

    try {
      // Report tab switch violation to server
      await reportViolation.mutateAsync({
        sessionId,
        violationType: 'tab_switched',
        detectionData: {
          timestamp: new Date().toISOString(),
          event: 'tab_switch',
          pageHidden: document.hidden,
          visibilityState: document.visibilityState
        },
        timestamp: new Date().toISOString()
      });

      console.log('Tab switch violation reported to server successfully');
    } catch (error) {
      console.error('Failed to report tab switch violation to server:', error);
    }

    onViolation('tab_switched');
  }, [sessionId, lastViolationTime, violationCooldown, showViolationAlert, reportViolation, onViolation]);

  const handleViolation = useCallback(async (violationType: 'no_face' | 'multiple_faces' | 'face_lost', detectionData?: any) => {
    const now = Date.now();

    // Check cooldown period
    if (now - lastViolationTime < violationCooldown) {
      console.log('Violation cooldown active, skipping');
      return;
    }

    // Only handle violation if alert is not already showing
    if (showViolationAlert) {
      console.log('Violation alert already showing, skipping');
      return;
    }

    setCurrentViolationType(violationType);
    setShowViolationAlert(true);
    setLastViolationTime(now);

    console.log(`Reporting violation to server: ${violationType}`);

    try {
      // Report violation to server
      await reportViolation.mutateAsync({
        sessionId,
        violationType,
        detectionData,
        timestamp: new Date().toISOString()
      });

      console.log('Violation reported to server successfully');
    } catch (error) {
      console.error('Failed to report violation to server:', error);
    }

    onViolation(violationType);
  }, [sessionId, lastViolationTime, violationCooldown, showViolationAlert, reportViolation, onViolation]);

  const startMonitoring = useCallback(() => {
    if (!isActive || !isModelsLoaded) return;

    setIsMonitoring(true);

    // Start periodic face detection
    intervalRef.current = setInterval(async () => {
      const faceCount = await detectFace();

      if (faceCount === null) {
        // Detection failed, treat as violation
        handleViolation('face_lost');
      } else if (faceCount === 0) {
        // No face detected
        handleViolation('no_face');
      } else if (faceCount > 1) {
        // Multiple faces detected
        handleViolation('multiple_faces');
      }
      // faceCount === 1 is good, no violation
    }, checkInterval);

    console.log('Face monitoring started');
  }, [isActive, isModelsLoaded, detectFace, checkInterval, handleViolation]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsMonitoring(false);
    console.log('Face monitoring stopped');
  }, []);

  const handleViolationAlertClose = useCallback(() => {
    setShowViolationAlert(false);

    // Server will handle termination logic
    console.log('Violation alert closed');
  }, []);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopMonitoring]);

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
