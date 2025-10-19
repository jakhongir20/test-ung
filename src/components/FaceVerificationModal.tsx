import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useI18n } from '../i18n';

interface FaceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const FaceVerificationModal: FC<FaceVerificationModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onSuccess,
                                                                        onError
                                                                      }) => {
  const {t} = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

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
        console.log('Face-api.js models loaded successfully');
      } catch (err) {
        console.error('Error loading face-api.js models:', err);
        onError('Failed to load face detection models');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadModels();
    }
  }, [isOpen, onError]);

  // Initialize camera and start detection
  useEffect(() => {
    const initializeCamera = async () => {
      if (!isOpen || !isModelsLoaded) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: {ideal: 480},
            height: {ideal: 320},
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            startFaceDetection();
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        onError('Camera access denied. Please allow camera access to continue.');
      }
    };

    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, isModelsLoaded, onError]);

  const startFaceDetection = async () => {
    if (!videoRef.current || !canvasRef.current || !isModelsLoaded) return;

    setIsDetecting(true);
    let consecutiveDetections = 0;
    const requiredDetections = 10; // Require 10 consecutive detections for verification
    let shouldContinueDetection = true;

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current || !shouldContinueDetection) return;

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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

          consecutiveDetections++;
          setDetectionCount(consecutiveDetections);
          console.log(`Face detected! Count: ${consecutiveDetections}/${requiredDetections}`);

          // Check if we have enough consecutive detections
          if (consecutiveDetections >= requiredDetections) {
            console.log('Face verification successful!');
            shouldContinueDetection = false;
            setIsDetecting(false);
            onSuccess();
            return;
          }
        } else if (detections.length === 0) {
          consecutiveDetections = 0;
          setDetectionCount(0);
          console.log('No face detected');
          setError('No face detected. Please position your face in the camera view.');
        } else {
          consecutiveDetections = 0;
          setDetectionCount(0);
          console.log(`Multiple faces detected: ${detections.length}`);
          setError('Multiple faces detected. Please ensure only one person is in the camera view.');
        }

        // Continue detection
        if (shouldContinueDetection) {
          requestAnimationFrame(detectFaces);
        }
      } catch (err) {
        console.error('Face detection error:', err);
        setError('Face detection failed. Please try again.');
        shouldContinueDetection = false;
        setIsDetecting(false);
      }
    };

    detectFaces();
  };

  const handleClose = () => {
    setIsDetecting(false);
    setDetectionCount(0);
    setError(null);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
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
                <p className="text-gray-600 mb-4">
                  {t('faceVerification.instructions')}
                </p>
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
                      {`Detection progress: ${detectionCount}/10`}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {detectionCount > 0 && detectionCount < 10 && !error && (
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
