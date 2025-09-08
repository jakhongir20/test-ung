import type { FC } from 'react';
import { useI18n } from "../i18n.tsx";

interface Props {
  className?: string;
  survey: any;
  index: number;
}

export const ProfileCardItem: FC<Props> = ({survey, index}) => {
  const {t} = useI18n()
  return (
    <article
      className="rounded-xl overflow-hidden bg-white border border-[#E2E8F0] flex flex-col h-full">
      {/* Blue Header Section */}
      <div className="bg-[#00A2DE] text-white p-4 relative overflow-hidden flex-shrink-0">
        {/* Decorative pattern in top right */}
        <div className="absolute top-0 right-0 h-full opacity-100">
          <img className={'h-full object-cover'} src="/bg/bg-card.png" alt="bgcard"/>
        </div>

        <div className="relative z-10">
          <div className="text-lg leading-5 font-bold mb-1">
            {survey?.survey?.title || `Test #${index + 1}`}
          </div>
          <div className="text-sm text-[#BFDBFE]">
            {survey?.last_attempt_at ?
              new Date(survey.last_attempt_at).toLocaleDateString() :
              'N/A'
            }
          </div>
        </div>
      </div>

      {/* White Content Section */}
      <div className="p-4 space-y-4 flex-grow flex flex-col">
        <div
          className={'bg-[#F8FAFC] flex flex-col items-center justify-center gap-1 py-6 border border-[#F1F5F9] rounded-lg flex-grow'}>
          <div className="text-base text-[#1E293B] font-semibold">
            {t('card.totalAnswers')}
          </div>
          <div className="text-6xl font-semibold text-[#00A2DE]">
            {survey?.best_score || 0}
          </div>
          <div className="text-sm text-[#64748B] underline">
            1-{survey?.survey?.questions_count || 30}
          </div>
        </div>

        {/* Score Details Button */}
        <button
          className="w-full rounded-[12px] border-2 border-[#00A2DE] h-12 text-[#00A2DE] bg-white hover:bg-[#00A2DE] hover:text-white transition-colors duration-200 py-2 text-base font-semibold flex-shrink-0">
          {t('profile.scoreDetails')}
        </button>
      </div>
    </article>
  );
};
