import type { FC } from 'react';
import { useEffect } from 'react';
import { useI18n } from '../i18n';
import { useNavigate } from "react-router-dom";
import { useCurrentSession, useMyHistory, useStartSurvey } from '../api/surveys';
import { handleAuthError } from '../api/auth';
import { MyProfileBanner } from "../components/MyProfileBanner.tsx";
import { ProfileCardItem } from "../components/ProfileCardItem.tsx";
import { BackgroundWrapper } from "../components/BackgroundWrapper.tsx";
import { FadeIn, PageTransition, StaggeredFadeIn } from "../components/animations";
import LoadingSvg from "../components/LoadingSvg.tsx";

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
  const {t} = useI18n();
  const navigate = useNavigate();
  const currentSession = useCurrentSession();
  const myHistory = useMyHistory();
  const startSurvey = useStartSurvey();

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
      const res = await startSurvey.mutateAsync({id: 1, count: 30});
      localStorage.setItem('currentSurveySession', JSON.stringify(res));
      navigate(`/test?sessionId=${res.id}`);
    } catch (error) {
      // Check if it's an authentication error and handle it
      if (handleAuthError(error)) {
        return; // Already redirected to login
      }
    }
  }

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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
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
            <MyProfileBanner/>
          </FadeIn>

          <FadeIn delay={200}>
            <section
              className={`flex md:gap-4 gap-2.5 flex-col p-4 md:p-8 justify-between bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px]`}>
              <div className="flex items-center gap-2 justify-between">
                <h3 className="text-base md:text-2xl font-semibold">{t('profile.results')}</h3>
                <button
                  onClick={handleStartTest}
                  className="inline-flex whitespace-nowrap items-center rounded-xl bg-[#F58634] px-4 h-10 md:h-[46px] md:px-5 text-white hover:bg-cyan-700 transition-colors duration-200"
                >
                   <span className={'justify-center flex gap-3 items-center'}>
                     {t('profile.newTest')}
                     {startSurvey.isPending &&
                       <LoadingSvg/>
                     }</span>
                </button>
              </div>

              {surveyHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.noTestHistory')}</h3>
                  <p className="text-gray-600 mb-6">
                    {t('empty.noTestHistoryDesc')}
                  </p>
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
                        <LoadingSvg/>
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
                    <ProfileCardItem key={session.id} survey={session} index={index} noButton={false}/>
                  ))}
                </StaggeredFadeIn>
              )}
            </section>
          </FadeIn>
        </div>
      </PageTransition>
    </BackgroundWrapper>
  );
};

export default ProfilePage;


