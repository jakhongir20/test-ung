import type { FC } from 'react';
import { useI18n } from '../i18n';
import { ACTION_BTN_STYLES, CARD_STYLES } from "../components/test/test.data.ts";
import { useStartSurvey } from "../api/surveys.ts";
import { useNavigate } from "react-router-dom";
import { handleAuthError } from "../api/auth.ts";

const PageRules: FC = () => {
  const {t} = useI18n();
  const startSurvey = useStartSurvey();
  const navigate = useNavigate();

  const rules = [
    {
      id: 'timing',
      title: t('rules.timing'),
      description: t('rules.timingDesc'),
      color: 'bg-[#FDFFF6]',
      icon: <img className={'w-full'} src="/rule-1.png" alt=""/>
    },
    {
      id: 'scores',
      title: t('rules.scores'),
      description: t('rules.scoresDesc'),
      color: 'bg-[#F6FEFF]',
      icon: <img className={'w-full'} src="/rule-2.png" alt=""/>
    },
    {
      id: 'assistiveTech',
      title: t('rules.assistiveTech'),
      description: t('rules.assistiveTechDesc'),
      color: 'bg-[#F8F6FF]',
      icon: <img className={'w-full'} src="/rule-3.png" alt=""/>
    },
    {
      id: 'noDeviceLock',
      title: t('rules.noDeviceLock'),
      description: t('rules.noDeviceLockDesc'),
      color: 'bg-[#F6FFF9]',
      icon: <img className={'w-full'} src="/rule-4.png" alt=""/>
    }
  ];

  return (
    <div className="min-h-screen ">
      <main className="max-w-7xl mx-auto lg:px-8 py-6 md:py-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-4 md:mb-6">
          {t('rules.title')}
        </h1>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {rules.map((rule, index) => (
            <div
              key={rule.id}
              className={` rounded-[16px] shadow-sm border border-[#E2E8F0] p-4 md:p-6 ${rule.color}`}
            >
              <div className="">
                <div className="flex-shrink-0 mb-2.5 md:mb-4">
                  <div
                    className={`md:w-[140px] w-[100px] flex items-center justify-center ${index === 0 && 'md:w-[120px] w-[80px]'}`}>
                    {rule.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1E293B] mb-2 md:mb-3">
                    {rule.title}
                  </h3>
                  <p className="text-black text-base leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className={`${CARD_STYLES} !flex-row !py-6`}>
          <span></span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => history.back()}
              className={ACTION_BTN_STYLES}>
              <img src={'/icon/arrow-l.svg'} alt={'icon left'}/>
            </button>
            <button
              disabled={startSurvey.isPending}
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
              className={`${ACTION_BTN_STYLES} !text-[#00A2DE] !text-base ${startSurvey.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {t('test.start')}
              {startSurvey.isPending && <div className={'w-6'}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                  <radialGradient id="a11" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)">
                    <stop offset="0" stop-color="#00A2DE"></stop>
                    <stop offset=".3" stop-color="#00A2DE" stop-opacity=".9"></stop>
                    <stop offset=".6" stop-color="#00A2DE" stop-opacity=".6"></stop>
                    <stop offset=".8" stop-color="#00A2DE" stop-opacity=".3"></stop>
                    <stop offset="1" stop-color="#00A2DE" stop-opacity="0"></stop>
                  </radialGradient>
                  <circle transform-origin="center" fill="none" stroke="url(#a11)" stroke-width="15"
                          stroke-linecap="round" stroke-dasharray="200 1000" stroke-dashoffset="0" cx="100" cy="100"
                          r="70">
                    <animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="360;0"
                                      keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform>
                  </circle>
                  <circle transform-origin="center" fill="none" opacity=".2" stroke="#00A2DE" stroke-width="15"
                          stroke-linecap="round" cx="100" cy="100" r="70"></circle>
                </svg>
              </div>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageRules;
