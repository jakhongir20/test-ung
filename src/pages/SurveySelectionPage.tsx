import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSurveysList } from '../api/generated/respondentWebAPI';
import { useStartSurvey } from '../api/surveys';
import { handleAuthError } from '../api/auth';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { FadeIn, PageTransition, StaggeredFadeIn } from '../components/animations';
import LoadingSvg from '../components/LoadingSvg';
import { useAuthStore } from '../stores/authStore';
import { FaceVerificationModal } from '../components/FaceVerificationModal';
import { useProctorVerifyInitial } from '../api/surveys';

type Survey = {
  id?: number;
  title?: string;
  description?: string;
  time_limit_minutes?: number;
  questions_count?: number;
  passing_score?: number;
  max_attempts?: number;
  total_questions?: number;
  user_attempts?: number;
  can_start?: boolean;
};

const SurveySelectionPage: FC = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null);
  const startSurvey = useStartSurvey();
  const proctorVerifyInitial = useProctorVerifyInitial();

  // Face verification state
  const [isFaceVerificationOpen, setIsFaceVerificationOpen] = useState(false);
  const [faceVerificationError, setFaceVerificationError] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  // Fetch surveys list
  const surveysQuery = useSurveysList({ lang }, {
    query: {
      enabled: true,
      retry: 1,
      retryDelay: 1000,
    },
  });

  // Handle authentication errors
  if (surveysQuery.error && handleAuthError(surveysQuery.error)) {
    return null; // Already redirected to login
  }

  // Safely extract surveys from API response
  // API may return array of arrays or just an array
  const surveysData = surveysQuery.data;
  let surveys: Survey[] = [];
  
  if (Array.isArray(surveysData)) {
    // Check if it's array of arrays (nested)
    if (surveysData.length > 0 && Array.isArray(surveysData[0])) {
      surveys = (surveysData as Survey[][])[0] || [];
    } else {
      // It's a flat array
      surveys = surveysData as Survey[];
    }
  }

  const handleSurveySelection = (surveyId: number) => {
    setSelectedSurvey(surveyId);
  };

  const handleStartTest = async () => {
    if (!selectedSurvey) {
      setFaceVerificationError(t('surveySelection.noSurveySelected') || 'Please select a survey');
      return;
    }

    try {
      // Start the selected survey
      const res = await startSurvey.mutateAsync({ id: selectedSurvey, count: 30 });
      const sessionId = res.id;
      if (!sessionId) {
        throw new Error('Failed to get session ID');
      }
      setPendingSessionId(sessionId);
      localStorage.setItem('currentSurveySession', JSON.stringify(res));
      sessionStorage.removeItem('faceReferenceDescriptor');

      // Open face verification modal with sessionId
      setIsFaceVerificationOpen(true);
      setFaceVerificationError(null);
    } catch (error) {
      // Check if it's an authentication error and handle it
      if (handleAuthError(error)) {
        return;
      }
      console.log('Failed to start survey:', error);
      setFaceVerificationError(t('surveySelection.startError') || 'Failed to start survey. Please try again.');
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

        // Mark face verification as completed
        sessionStorage.setItem(`faceVerificationCompleted_${pendingSessionId}`, 'true');

        // Navigate to test page after successful API call
        navigate(`/test?sessionId=${pendingSessionId}`);
      } catch (error) {
        console.log('Failed to send face verification:', error);
        setFaceVerificationError('Failed to verify face. Please try again.');
      }
    } else if (pendingSessionId) {
      // Check if face verification was completed before navigating
      const isFaceVerificationCompleted = sessionStorage.getItem(`faceVerificationCompleted_${pendingSessionId}`) === 'true';
      if (isFaceVerificationCompleted) {
        navigate(`/test?sessionId=${pendingSessionId}`);
      } else {
        setFaceVerificationError('Face verification must be completed before starting the test.');
      }
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
  if (surveysQuery.isLoading) {
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('loading.surveys') || 'Loading surveys...'}</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (surveysQuery.error) {
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
            onClick={() => surveysQuery.refetch()}
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
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {t('surveySelection.title') || 'Select Surveys'}
              </h1>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                {t('common.back') || 'Back'}
              </button>
            </div>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 mb-4">
                {t('surveySelection.description') || 'Select a survey to start.'}
              </p>
            </div>
          </FadeIn>

          {surveys.length === 0 ? (
            <FadeIn delay={300}>
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('surveySelection.noSurveys') || 'No surveys available'}
                </h3>
              </div>
            </FadeIn>
          ) : (
            <StaggeredFadeIn delay={300} staggerDelay={100} direction="top" className="space-y-4">
              {surveys.map((survey) => {
                if (!survey.id) return null;
                const isSelected = selectedSurvey === survey.id;
                return (
                  <div
                    key={survey.id}
                    onClick={() => handleSurveySelection(survey.id!)}
                    className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {survey.title || `Survey #${survey.id}`}
                        </h3>
                        {survey.description && (
                          <p className="text-gray-600 mb-3">{survey.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          {survey.time_limit_minutes && (
                            <span>
                              {t('surveySelection.timeLimit') || 'Time limit'}: {survey.time_limit_minutes} {t('common.minutes') || 'min'}
                            </span>
                          )}
                          {survey.questions_count && (
                            <span>
                              {t('surveySelection.questions') || 'Questions'}: {survey.questions_count}
                            </span>
                          )}
                          {survey.total_questions && (
                            <span>
                              {t('surveySelection.totalQuestions') || 'Total'}: {survey.total_questions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </StaggeredFadeIn>
          )}

          {surveys.length > 0 && (
            <FadeIn delay={400}>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleStartTest}
                  disabled={startSurvey.isPending || !selectedSurvey}
                  className="px-6 py-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>
                    {t('surveySelection.startTest') || 'Start Test'}
                  </span>
                  {startSurvey.isPending && <LoadingSvg />}
                </button>
              </div>
            </FadeIn>
          )}
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

export default SurveySelectionPage;

