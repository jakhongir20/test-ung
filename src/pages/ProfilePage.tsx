import type { FC } from 'react';
import { useEffect } from 'react';
import { useI18n } from '../i18n';
import { useNavigate } from "react-router-dom";
import { useStartSurvey, useCurrentSession } from '../api/surveys';

const statCards = [
  { id: 1, title: 'Test #1', date: 'March 19, 2025', value: 24 },
  { id: 2, title: 'Test #2', date: 'March 19, 2025', value: 16 },
  { id: 3, title: 'Test #3', date: 'March 19, 2025', value: 4 },
  { id: 4, title: 'Test #4', date: 'March 19, 2025', value: 17 },
];

const ProfilePage: FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const startSurvey = useStartSurvey();
  const currentSession = useCurrentSession();

  // Check for active session on component mount
  useEffect(() => {
    if (currentSession.data?.session) {
      // Store the session data and navigate to test page with sessionId param
      localStorage.setItem('currentSurveySession', JSON.stringify(currentSession.data.session));
      navigate(`/test?sessionId=${currentSession.data.session.id}`);
    }
  }, [currentSession.data, navigate]);
  return (
    <div className="space-y-6">
      <section className="rounded-xl h-[250px] bg-[#00A2DE] text-white p-6 md:p-10 relative overflow-hidden">
        <h2 className="text-xl md:text-2xl font-semibold tracking-wide">{t('profile.title')}</h2>
        <p className="mt-2 max-w-2xl text-white/90 text-sm md:text-base">
          {t('profile.subtitle')}
        </p>
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />
      </section>

      {/*<section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 md:p-6">*/}
      {/*  <h3 className="text-base md:text-lg font-semibold">{t('profile.myDetails')}</h3>*/}
      {/*  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">*/}
      {/*    <div>*/}
      {/*      <label className="block text-sm font-medium text-gray-600">{t('profile.fio')}</label>*/}
      {/*      <input className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500"*/}
      {/*             placeholder="ФИО"/>*/}
      {/*    </div>*/}
      {/*    <div>*/}
      {/*      <label className="block text-sm font-medium text-gray-600">{t('profile.branch')}</label>*/}
      {/*      <select className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500">*/}
      {/*        <option>Филиал</option>*/}
      {/*      </select>*/}
      {/*    </div>*/}
      {/*    <div>*/}
      {/*      <label className="block text-sm font-medium text-gray-600">{t('profile.position')}</label>*/}
      {/*      <select className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500">*/}
      {/*        <option>Должность</option>*/}
      {/*      </select>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold">{t('profile.results')}</h3>
          <button
            onClick={async () => {
              try {
                const res = await startSurvey.mutateAsync({ id: 1, count: 30 });
                localStorage.setItem('currentSurveySession', JSON.stringify(res));
                navigate(`/test?sessionId=${res.id}`);
              } catch {
              }
            }}
            className="inline-flex items-center rounded-lg bg-cyan-600 px-3 py-2 text-white text-sm hover:bg-cyan-700"
          >
            {t('profile.newTest')}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c) => (
            <article key={c.id}
              className="rounded-xl overflow-hidden ring-1 ring-gray-200 bg-gradient-to-b from-cyan-600 to-cyan-700 text-white">
              <div className="p-4">
                <div className="flex items-center justify-between text-sm opacity-90">
                  <div className="font-semibold">{c.title}</div>
                  <div>{c.date}</div>
                </div>
              </div>
              <div className="bg-white text-gray-800 mx-4 rounded-lg shadow-sm p-6 grid place-items-center">
                <div className="text-center">
                  <div className="text-xs text-gray-500">{t('card.totalAnswers')}</div>
                  <div className="text-5xl font-bold text-cyan-700">{c.value}</div>
                  <div className="text-xs text-gray-500">1-30</div>
                </div>
              </div>
              <div className="p-4">
                <button
                  className="w-full rounded-lg border border-white/30 hover:bg-white/10 py-2 text-sm">{t('profile.scoreDetails')}</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage


