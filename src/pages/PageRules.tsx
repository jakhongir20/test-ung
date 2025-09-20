import type { FC } from 'react';
import { useI18n } from '../i18n';
import { ACTION_BTN_STYLES, CARD_STYLES } from "../components/test/test.data.ts";
import { useStartSurvey } from "../api/surveys.ts";
import { useNavigate } from "react-router-dom";
import { handleAuthError } from "../api/auth.ts";
import { BackgroundWrapper } from "../components/BackgroundWrapper.tsx";
import LoadingSvg from "../components/LoadingSvg.tsx";

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
    <BackgroundWrapper>
      <div className="min-h-screen md:p-6">
        <main className="max-w-7xl mx-auto lg:px-8 py-6 md:py-8">
          <h1 className="text-2xl font-bold text-[#1E293B] mb-4 md:mb-6">
            {t('rules.title')}
          </h1>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {rules.map((rule, index) => (
              <div
                key={rule.id}
                className={`rounded-[16px] shadow-sm border border-[#E2E8F0] p-4 md:p-6 ${rule.color}`}
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
                className={`${ACTION_BTN_STYLES} !bg-[#00A2DE] text-white`}>
                <img src={'/icon/arrow-l-w.svg'} alt={'icon left'}/>
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
                className={`${ACTION_BTN_STYLES} !bg-[#00A2DE] text-white !text-base ${startSurvey.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {t('test.start')}
                {startSurvey.isPending &&
                  <LoadingSvg/>
                }
              </button>
            </div>
          </div>
        </main>
      </div>
    </BackgroundWrapper>
  );
};

export default PageRules;
