import type { FC } from 'react';
import { useEffect } from 'react';
import { useI18n } from '../i18n';
import { useNavigate } from "react-router-dom";
import { useCurrentSession, useMyHistory, useStartSurvey } from '../api/surveys';
import { handleAuthError } from '../api/auth';

const ProfilePage: FC = () => {
  const {t} = useI18n();
  const navigate = useNavigate();
  const startSurvey = useStartSurvey();
  const currentSession = useCurrentSession();
  const myHistory = useMyHistory();

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

  // Get survey history data
  const historyData = myHistory.data as any;
  const surveyHistory = historyData || [];

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile</h2>
          <p className="text-gray-600">
            Please wait while we load your test history...
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to load your test history. Please check your connection and try again.
          </p>
          <button
            onClick={() => myHistory.refetch()}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-[16px] h-[180px] md:h-[250px] flex flex-col justify-center bg-[#00A2DE] text-white p-6 md:p-10 relative overflow-hidden">
        <img className={'absolute end-0 sm:end-[36px] sm:w-auto sm:h-auto h-full object-cover w-full top-0'}
             src="/bg/profile-bg.png" alt=""/>
        <h2 className="text-2xl md:text-[32px] mb-3 uppercase font-medium tracking-widest">{t('profile.title')}</h2>
        <p className="mt-2 max-w-sm text-white/90 text-sm">
          {t('profile.subtitle')}
        </p>
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl"/>
      </section>
      <section
        className={`flex md:gap-4 gap-2.5 flex-col p-4 md:p-8 justify-between bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px]`}>
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold">{t('profile.results')}</h3>
          <button
            onClick={async () => {
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
            }}
            className="inline-flex items-center rounded-xl bg-[#00A2DE] px-4 h-10 md:h-[46px] md:px-5  text-white text-sm hover:bg-cyan-700"
          >
            {t('profile.newTest')}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test history yet</h3>
            <p className="text-gray-600 mb-6">
              Start your first test to see your results here.
            </p>
            <button
              onClick={async () => {
                try {
                  const res = await startSurvey.mutateAsync({id: 1, count: 30});
                  localStorage.setItem('currentSurveySession', JSON.stringify(res));
                  navigate(`/test?sessionId=${res.id}`);
                } catch (error) {
                  if (handleAuthError(error)) {
                    return;
                  }
                }
              }}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 font-medium"
            >
              Start Your First Test
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {surveyHistory.map((survey: any, index: number) => (
              <article key={index}
                       className="rounded-xl overflow-hidden ring-1 ring-gray-200 bg-gradient-to-b from-cyan-600 to-cyan-700 text-white">
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm opacity-90">
                    <div className="font-semibold">
                      {survey.survey?.title || `Test #${index + 1}`}
                    </div>
                    <div>
                      {survey.last_attempt_at ?
                        new Date(survey.last_attempt_at).toLocaleDateString() :
                        'N/A'
                      }
                    </div>
                  </div>
                </div>
                <div className="bg-white text-gray-800 mx-4 rounded-lg shadow-sm p-6 grid place-items-center">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">{t('card.totalAnswers')}</div>
                    <div className="text-5xl font-bold text-cyan-700">
                      {survey.best_score || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {survey.survey?.questions_count || 30} questions
                    </div>
                    {survey.best_percentage && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        {Number(survey.best_percentage)?.toFixed(1)}% score
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs opacity-90">
                      {survey.total_attempts || 0} attempts
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${survey.is_passed
                      ? 'bg-green-500/20 text-green-100'
                      : 'bg-red-500/20 text-red-100'
                    }`}>
                      {survey.is_passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <button
                    className="w-full rounded-lg border border-white/30 hover:bg-white/10 py-2 text-sm">
                    {t('profile.scoreDetails')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;


