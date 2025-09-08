import type { FC } from 'react';
import { useEffect } from 'react';
import { useI18n } from '../i18n';
import { useNavigate } from "react-router-dom";
import { useCurrentSession, useMyHistory, useStartSurvey } from '../api/surveys';
import { handleAuthError } from '../api/auth';
import { MyProfileBanner } from "../components/MyProfileBanner.tsx";
import { ProfileCardItem } from "../components/ProfileCardItem.tsx";

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
    <div className="space-y-6">
      <MyProfileBanner/>
      {/*<MyDetailsForm />*/}
      <section
        className={`flex md:gap-4 gap-2.5 flex-col p-4 md:p-8 justify-between bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px]`}>
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold">{t('profile.results')}</h3>
          <button
            onClick={() => navigate('/rules')}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.noTestHistory')}</h3>
            <p className="text-gray-600 mb-6">
              {t('empty.noTestHistoryDesc')}
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
              {t('empty.startFirstTest')}
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
            {surveyHistory.map((survey: any, index: number) => (
              <ProfileCardItem survey={survey} index={index}/>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;


