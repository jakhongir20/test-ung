import type { FC } from 'react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as faceapi from 'face-api.js';
import { useI18n } from '../i18n';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface FaceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (faceImageBlob: Blob) => void;
  onError: (error: string) => void;
  sessionId?: string;
  userId?: string;
}

export const FaceVerificationModal: FC<FaceVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useBodyScrollLock(isOpen);

  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const verificationSteps = useMemo(
    () => [
      { key: 'center', instruction: t('faceVerification.step.center'), label: t('faceVerification.stepLabel.center') },
      { key: 'left', instruction: t('faceVerification.step.left'), label: t('faceVerification.stepLabel.left') },
      { key: 'right', instruction: t('faceVerification.step.right'), label: t('faceVerification.stepLabel.right') }
    ],
    [t]
  );

  const totalSteps = verificationSteps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepInstruction, setStepInstruction] = useState<string>(verificationSteps[0]?.instruction ?? '');
  const currentStepIndexRef = useRef(0);
  const verificationStepsRef = useRef(verificationSteps);

  useEffect(() => {
    verificationStepsRef.current = verificationSteps;
    setStepInstruction(verificationSteps[currentStepIndex]?.instruction ?? '');
  }, [verificationSteps, currentStepIndex]);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
    setDetectionCount(0);
    if (currentStepIndex === 0) {
      setError(null);
    }
  }, [currentStepIndex]);

  const requiredDetectionsForCurrentStep = currentStepIndex === 0 ? 10 : 5;

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);

        // Load the required models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);

        setIsModelsLoaded(true);
        console.log('🎯 Face Verification: Models loaded successfully');
      } catch {
        console.log('❌ Face Verification: Failed to load face detection models');
        onError('Failed to load face detection models');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadModels();
    }
  }, [isOpen, onError]);

  const startFaceDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isModelsLoaded) return;

    console.log('🚀 Face Verification: Starting face detection process');
    setIsDetecting(true);
    let consecutiveDetections = 0;
    let shouldContinueDetection = true;

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current || !shouldContinueDetection) return;

      const stepIndex = currentStepIndexRef.current;
      const steps = verificationStepsRef.current;
      const currentStep = steps[stepIndex];
      const requiredDetectionsForStep = stepIndex === 0 ? 10 : 5;
      const isLastStep = stepIndex === steps.length - 1;

      try {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 })
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the full video frame to canvas first
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Log detection data for backend developer
        const detectionData = {
          timestamp: new Date().toISOString(),
          step: currentStep?.key,
          faceCount: detections.length,
          requiredDetectionsForStep,
          videoDimensions: {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          },
          detections: detections.map(detection => ({
            confidence: detection.detection.score,
            box: {
              x: detection.detection.box.x,
              y: detection.detection.box.y,
              width: detection.detection.box.width,
              height: detection.detection.box.height
            },
            landmarks: detection.landmarks?.positions?.length || 0,
            expressions: detection.expressions ? Object.keys(detection.expressions).length : 0
          }))
        };

        console.log('📊 Face Detection Data for Backend:', detectionData);

        if (detections.length === 1) {
          // Clear any previous errors when face is detected
          if (error) {
            setError(null);
          }

          // Draw face detection box
          const detection = detections[0];
          const box = detection.detection.box;

          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Draw landmarks
          const landmarks = detection.landmarks;
          ctx.fillStyle = '#00ff00';
          landmarks.positions.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });

          // Check head pose (yaw angle) to verify correct orientation for current step
          // Calculate approximate yaw from nose and face center points
          // When head turns left (counter-clockwise), nose moves right in camera view (positive offset)
          // When head turns right (clockwise), nose moves left in camera view (negative offset)
          // So we need to negate to match convention: negative = left, positive = right
          const noseTip = landmarks.positions[30]; // Nose tip
          const leftFaceCenter = landmarks.positions[1]; // Left face center point  
          const rightFaceCenter = landmarks.positions[15]; // Right face center point

          // Calculate face width and nose position relative to center
          const faceWidth = Math.abs(rightFaceCenter.x - leftFaceCenter.x);
          const faceCenterX = (leftFaceCenter.x + rightFaceCenter.x) / 2;
          const noseOffset = noseTip.x - faceCenterX;

          // Normalize offset and negate to match yaw convention: negative = left, positive = right
          const yaw = -noseOffset / (faceWidth / 2);

          // Determine current head position based on yaw angle
          let currentHeadPosition: 'center' | 'left' | 'right' = 'center';
          if (yaw < -0.3) {
            // Looking left
            currentHeadPosition = 'left';
          } else if (yaw > 0.3) {
            // Looking right
            currentHeadPosition = 'right';
          }
          // else: center (yaw between -0.3 and 0.3)

          // Check if head position matches the required step
          const requiredPosition = currentStep?.key as 'center' | 'left' | 'right';
          const isCorrectPosition = currentHeadPosition === requiredPosition;

          if (isCorrectPosition) {
            // Only increment if the face is in the correct position for this step
            consecutiveDetections++;
            setDetectionCount(consecutiveDetections);
            console.log(`✅ Face Verification [${currentStep?.key}]: Valid face detected in correct position (yaw: ${yaw.toFixed(2)})! Count: ${consecutiveDetections}/${requiredDetectionsForStep}`);
          } else {
            // Reset count if face is not in correct position
            consecutiveDetections = 0;
            setDetectionCount(0);
            console.log(`⚠️ Face Verification [${currentStep?.key}]: Face detected but wrong position (yaw: ${yaw.toFixed(2)}, current: ${currentHeadPosition}, required: ${requiredPosition})`);

            // Show appropriate error message
            if (requiredPosition === 'center') {
              setError(t('faceVerification.lookCenter'));
            } else if (requiredPosition === 'left') {
              setError(t('faceVerification.turnLeft'));
            } else if (requiredPosition === 'right') {
              setError(t('faceVerification.turnRight'));
            }
          }

          // Check if we have enough consecutive detections for the current step
          if (consecutiveDetections >= requiredDetectionsForStep) {
            if (!isLastStep) {
              console.log(`🎯 Face Verification: Step "${currentStep?.key}" completed. Moving to next step.`);
              consecutiveDetections = 0;
              setDetectionCount(0);
              setError(null);
              const nextIndex = stepIndex + 1;
              currentStepIndexRef.current = nextIndex;
              setCurrentStepIndex(nextIndex);
              requestAnimationFrame(detectFaces);
              return;
            }

            console.log('🎉 Face Verification: All steps completed successfully');
            shouldContinueDetection = false;
            setIsDetecting(false);

            // Capture full video frame image from canvas and pass to parent component
            const video = videoRef.current;
            if (canvas && video) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              }

              canvas.toBlob((blob) => {
                if (blob) {
                  onSuccess(blob);
                } else {
                  onError(t('faceVerification.captureError'));
                }
              }, 'image/jpeg', 0.95);
            } else {
              onError(t('faceVerification.captureError'));
            }
            return;
          }
        } else if (detections.length === 0) {
          consecutiveDetections = 0;
          setDetectionCount(0);
          if (stepIndex === 0) {
            console.log('⚠️ Face Verification: No face detected - keep facing the camera');
            setAttemptCount(prev => prev + 1);
            setError(t('faceVerification.noFaceFront'));
          } else {
            console.log(`ℹ️ Face Verification: Waiting for face during step "${currentStep?.key}"`);
            setError(null);
          }
        } else {
          consecutiveDetections = 0;
          setDetectionCount(0);
          console.log(`⚠️ Face Verification: Multiple faces detected (${detections.length}) - attempt failed`);
          if (stepIndex === 0) {
            setAttemptCount(prev => prev + 1);
          }
          setError(t('faceVerification.multipleFaces'));
        }

        // Continue detection
        if (shouldContinueDetection) {
          requestAnimationFrame(detectFaces);
        }
      } catch (err) {
        console.log('❌ Face Verification: Face detection error occurred', err);
        if (currentStepIndexRef.current === 0) {
          setAttemptCount(prev => prev + 1);
        }
        setError(t('faceVerification.detectionError'));
        shouldContinueDetection = false;
        setIsDetecting(false);
      }
    };

    detectFaces();
  }, [isModelsLoaded, onSuccess, onError, t, error]);

  // Initialize camera and start detection
  useEffect(() => {
    const initializeCamera = async () => {
      if (!isOpen || !isModelsLoaded) return;

      try {
        console.log('📷 Face Verification: Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 480 },
            height: { ideal: 320 },
            facingMode: 'user'
          }
        });

        console.log('✅ Face Verification: Camera access granted');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            startFaceDetection();
          };
        }
      } catch (err) {
        console.log('❌ Face Verification: Camera access denied', err);
        setAttemptCount(prev => prev + 1);
        onError(t('faceVerification.cameraAccessDenied'));
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
  }, [isOpen, isModelsLoaded, onError, t]);

  // Log when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 Face Verification: Modal opened - starting verification process');
      setAttemptCount(0);
      currentStepIndexRef.current = 0;
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // Log attempt summary for backend developer
  useEffect(() => {
    if (attemptCount > 0) {
      const currentStep = verificationSteps[currentStepIndex];
      const requiredForStep = currentStepIndex === 0 ? 10 : 5;
      const attemptSummary = {
        timestamp: new Date().toISOString(),
        attemptCount,
        detectionCount,
        currentStep: currentStep?.key,
        requiredDetections: requiredForStep,
        isSuccess:
          currentStepIndexRef.current === verificationStepsRef.current.length - 1 &&
          detectionCount >= requiredForStep,
        error: error || null,
        sessionData: {
          // This is what should be sent to backend
          userId: 'current_user_id', // Get from auth context
          sessionId: 'current_session_id', // Get from current session
          verificationType: 'face_verification',
          attemptNumber: attemptCount,
          success:
            currentStepIndexRef.current === verificationStepsRef.current.length - 1 &&
            detectionCount >= requiredForStep,
          detectionData: {
            consecutiveDetections: detectionCount,
            requiredDetections: requiredForStep,
            currentStep: currentStep?.key,
            lastError: error || null
          }
        }
      };

      console.log('📋 Face Verification Attempt Summary for Backend:', JSON.stringify(attemptSummary, null, 2));
    }
  }, [attemptCount, detectionCount, error, currentStepIndex, verificationSteps]);

  const handleClose = () => {
    console.log(`📊 Face Verification: Modal closed. Total attempts: ${attemptCount}`);
    setIsDetecting(false);
    setDetectionCount(0);
    setError(null);
    setAttemptCount(0);
    currentStepIndexRef.current = 0;
    setCurrentStepIndex(0);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute w-full h-full inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full px-6 py-8  z-[99999]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('faceVerification.title')}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600">
                {t('faceVerification.loading')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600">
                  {t('faceVerification.multiStepIntro')}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <p className="text-sm font-semibold text-blue-800">
                  {t('faceVerification.stepProgress', { current: currentStepIndex + 1, total: totalSteps })}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {stepInstruction}
                </p>
              </div>
              <div className="flex justify-center gap-4">
                {verificationSteps.map((step, index) => {
                  const status = index < currentStepIndex ? 'completed' : index === currentStepIndex ? 'current' : 'upcoming';
                  const circleClass =
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'current'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500';
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${circleClass}`}>
                        {index + 1}
                      </div>
                      <span className="text-xs text-gray-600 text-center w-20 leading-tight">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Camera View */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </div>

              {/* Detection Status */}
              <div className="text-center">
                {isDetecting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">
                        {t('faceVerification.detecting')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('faceVerification.detectionProgress', {
                        count: detectionCount,
                        required: requiredDetectionsForCurrentStep
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {detectionCount > 0 && detectionCount < requiredDetectionsForCurrentStep && !error && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                    {t('faceVerification.faceDetected')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {t('faceVerification.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
