import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrentSession, useMyHistory, useStartSurvey, useProctorVerifyInitial } from '../api/surveys';
import { handleAuthError } from '../api/auth';
import { MyProfileBanner } from "../components/MyProfileBanner.tsx";
import { ProfileCardItem } from "../components/ProfileCardItem.tsx";
import { BackgroundWrapper } from "../components/BackgroundWrapper.tsx";
import { FaceVerificationModal } from "../components/FaceVerificationModal.tsx";
import { FadeIn, PageTransition, StaggeredFadeIn } from "../components/animations";
import LoadingSvg from "../components/LoadingSvg.tsx";
import { useAuthStore } from "../stores/authStore";

// Type for session data from the API
interface Session {
  id: string;
  survey: {
    id: number;
    title: string;
    description: string;
    time_limit_minutes: number;
    questions_count: number;
    passing_score: number;
    max_attempts: number;
    total_questions: string;
  };
  status: "started" | "completed" | "cancelled" | "expired";
  attempt_number: number;
  started_at: string;
  expires_at: string;
  language: string;
  progress: string;
  time_remaining: string;
  current_question: string;
  score: number;
  total_points: number;
  percentage: string;
  is_passed: boolean;
}

const ProfilePage: FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSession = useCurrentSession();
  const myHistory = useMyHistory();
  const startSurvey = useStartSurvey();
  const proctorVerifyInitial = useProctorVerifyInitial();
  const { user } = useAuthStore();

  // Face verification state
  const [isFaceVerificationOpen, setIsFaceVerificationOpen] = useState(false);
  const [faceVerificationError, setFaceVerificationError] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  // Check for test termination error
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'test_terminated') {
      setFaceVerificationError(t('faceMonitoring.testTerminatedMessage'));
      // Clear the URL parameter
      navigate('/profile', { replace: true });
    }
  }, [searchParams, navigate, t]);

  // Check for active session on component mount
  useEffect(() => {
    if (currentSession.data?.session) {
      // Store the session data and navigate to test page with sessionId param
      localStorage.setItem('currentSurveySession', JSON.stringify(currentSession.data.session));
      navigate(`/test?sessionId=${currentSession.data.session.id}`);
    }
  }, [currentSession.data, navigate]);

  // Handle authentication errors
  useEffect(() => {
    if (myHistory.error && handleAuthError(myHistory.error)) {
      return; // Already redirected to login
    }
  }, [myHistory.error]);

  // Get session history data
  const historyData = myHistory.data as Session[] | undefined;
  const surveyHistory = historyData || [];

  const handleStartTest = async () => {
    try {
      // Start the survey first to get sessionId
      const res = await startSurvey.mutateAsync({ id: 1, count: 30 });
      const sessionId = res.id;
      if (!sessionId) {
        throw new Error('Failed to get session ID');
      }
      setPendingSessionId(sessionId);
      localStorage.setItem('currentSurveySession', JSON.stringify(res));
      sessionStorage.removeItem('faceReferenceDescriptor');

      // Open face verification modal with sessionId
      // The actual face_image will be sent after successful verification in the modal
      setIsFaceVerificationOpen(true);
      setFaceVerificationError(null);
    } catch (error) {
      // Check if it's an authentication error and handle it
      if (handleAuthError(error)) {
        return;
      }
      console.log('Failed to start survey:', error);
    }
  };

  const handleFaceVerificationSuccess = async (faceImageBlob: Blob, faceDescriptor: number[] | null) => {
    setIsFaceVerificationOpen(false);

    try {
      if (faceDescriptor && faceDescriptor.length > 0) {
        sessionStorage.setItem('faceReferenceDescriptor', JSON.stringify(faceDescriptor));
      } else {
        sessionStorage.removeItem('faceReferenceDescriptor');
      }
    } catch (error) {
      console.log('Failed to cache face reference descriptor', error);
    }

    // Send sessionId and face_image to /api/proctor/verify-initial/ after successful verification
    if (pendingSessionId && faceImageBlob) {
      try {
        const verifyResponse = await proctorVerifyInitial.mutateAsync({
          data: {
            session_id: pendingSessionId,
            face_image: faceImageBlob,
          },
        });

        // Handle response with status and session_id
        if (verifyResponse) {
          const responseData = verifyResponse as { status?: string; session_id?: string; };
          console.log('Face verification sent successfully:', {
            status: responseData.status,
            session_id: responseData.session_id,
          });
        }

        // Navigate to test page after successful API call
        navigate(`/test?sessionId=${pendingSessionId}`);
      } catch (error) {
        console.log('Failed to send face verification:', error);
        setFaceVerificationError('Failed to verify face. Please try again.');
        // Still navigate to test page even if API call fails
        navigate(`/test?sessionId=${pendingSessionId}`);
      }
    } else if (pendingSessionId) {
      // Navigate even if blob is missing
      navigate(`/test?sessionId=${pendingSessionId}`);
    }
  };

  const handleFaceVerificationError = (error: string) => {
    setFaceVerificationError(error);
    setIsFaceVerificationOpen(false);
  };

  const handleFaceVerificationClose = () => {
    setIsFaceVerificationOpen(false);
    setFaceVerificationError(null);
  };

  // Loading state
  if (myHistory.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('loading.profile')}</h2>
          <p className="text-gray-600">
            {t('loading.profileDesc')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (myHistory.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('error.connection')}</h2>
          <p className="text-gray-600 mb-4">
            {t('error.connectionDesc')}
          </p>
          <button
            onClick={() => myHistory.refetch()}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <BackgroundWrapper>
      <PageTransition>
        <div className="space-y-6 md:p-6">
          <FadeIn delay={100}>
            <MyProfileBanner />
          </FadeIn>

          {/* Face Verification Error Display */}
          {faceVerificationError && (
            <FadeIn delay={150}>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800 text-sm">{faceVerificationError}</p>
                </div>
                <button
                  onClick={() => setFaceVerificationError(null)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  {t('dismiss')}
                </button>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={200}>
            <section
              className={`flex md:gap-4 gap-2.5 flex-col p-4 md:p-8 justify-between bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px]`}>
              <div className="flex items-center gap-2 justify-between">
                <h3 className="text-base md:text-2xl font-semibold">{t('profile.results')}</h3>
                <button
                  onClick={handleStartTest}
                  disabled={startSurvey.isPending}
                  className="inline-flex whitespace-nowrap items-center rounded-xl bg-[#F58634] px-4 h-10 md:h-[46px] md:px-5 text-white hover:bg-cyan-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={'justify-center flex gap-3 items-center'}>
                    {t('profile.newTest')}
                    {startSurvey.isPending &&
                      <LoadingSvg />
                    }</span>
                </button>
              </div>

              {surveyHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.noTestHistory')}</h3>
                  <button
                    disabled={startSurvey.isPending}
                    onClick={handleStartTest}
                    className={`bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 font-medium transition-colors duration-200 
                    ${startSurvey.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/*className={`${ACTION_BTN_STYLES} !bg-[#00A2DE] text-white !text-base ${startSurvey.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>*/}
                    <span className={'justify-center flex gap-3 items-center'}>
                      {t('empty.startFirstTest')}
                      {startSurvey.isPending &&
                        <LoadingSvg />
                      }</span>
                  </button>
                  {/*<button*/}
                  {/*  onClick={() => navigate(`/rules`)}*/}
                  {/*  className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 font-medium transition-colors duration-200"*/}
                  {/*>*/}
                  {/*  {t('empty.startFirstTest')}*/}
                  {/*</button>*/}
                </div>
              ) : (
                <StaggeredFadeIn delay={300} staggerDelay={100} direction="top"
                  className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
                  {surveyHistory.map((session: Session, index: number) => (
                    <ProfileCardItem key={session.id} survey={session} index={index} noButton={false} />
                  ))}
                </StaggeredFadeIn>
              )}
            </section>
          </FadeIn>
        </div>
      </PageTransition>

      {/* Face Verification Modal */}
      <FaceVerificationModal
        isOpen={isFaceVerificationOpen}
        onClose={handleFaceVerificationClose}
        onSuccess={handleFaceVerificationSuccess}
        onError={handleFaceVerificationError}
        sessionId={pendingSessionId || undefined}
        userId={user?.id?.toString()}
      />
    </BackgroundWrapper>
  );
};

export default ProfilePage;


