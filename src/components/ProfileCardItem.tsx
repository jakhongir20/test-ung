import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from "../i18n.tsx";

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

interface SurveyHistoryItem {
  id?: string;
  score?: number;
  total_questions?: number;
  completed_at?: string;
  survey?: {
    title?: string;
    questions_count?: number;
  };
  status?: string;
  attempt_number?: number;
}

interface Props {
  className?: string;
  survey: Session | SurveyHistoryItem;
  index: number;
  noButton: boolean;
  variant?: 'session' | 'history'; // Add variant to distinguish between different data types
}

export const ProfileCardItem: FC<Props> = ({survey, index}) => {
  const {t} = useI18n();
  const navigate = useNavigate();

  // Helper function to check if survey is Session type
  const isSession = (survey: Session | SurveyHistoryItem): survey is Session => {
    return 'started_at' in survey && 'expires_at' in survey;
  };

  // Helper function to get survey title
  const getSurveyTitle = () => {
    if (isSession(survey)) {
      return survey?.survey?.title || `Test #${index + 1}`;
    } else {
      return survey?.survey?.title || `Test #${index + 1}`;
    }
  };

  // Helper function to get date
  const getDate = () => {
    if (isSession(survey)) {
      return survey?.started_at ? new Date(survey.started_at).toLocaleDateString() : t('na');
    } else {
      return survey?.completed_at ? new Date(survey.completed_at).toLocaleDateString() : t('na');
    }
  };

  // Helper function to get score
  const getScore = () => {
    return survey?.score || 0;
  };

  // Helper function to get total questions
  const getTotalQuestions = () => {
    if (isSession(survey)) {
      // return survey?.survey?.questions_count || 30;
      return survey?.total_points || 30;
    } else {
      return survey?.survey?.questions_count || survey?.total_questions || 30;
    }
  };

  // Helper function to get session ID
  const getSessionId = () => {
    return survey?.id || '';
  };

  const handleScoreDetailsClick = () => {
    const sessionId = getSessionId();
    if (sessionId) {
      navigate(`/session/${sessionId}`);
    }
  };

  return (
    <article
      className="rounded-xl overflow-hidden bg-white border border-[#E2E8F0] flex flex-col h-full">
      {/* Blue Header Section */}
      <div className="bg-[#F58634] text-white p-4 relative overflow-hidden flex-shrink-0">
        {/* Decorative pattern in top right */}
        <div className="absolute top-0 right-0 h-full opacity-100">
          <img className={'h-full object-cover'} src="/bg/bg-card.png" alt="bgcard"/>
        </div>

        <div className="relative">
          <div className="text-lg leading-5 font-bold mb-1">
            {getSurveyTitle()}
          </div>
          <div className="text-base text-gray-100">
            {getDate()}
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
          <div className="text-6xl font-semibold text-[#F58634]">
            {getScore()}
          </div>
          <div className="text-base text-[#64748B] underline">
            1-{getTotalQuestions()}
          </div>
        </div>

        {/* Score Details Button */}
        <button
          onClick={handleScoreDetailsClick}
          className="w-full rounded-[12px] border-2 border-[#00A2DE] h-12 text-[#00A2DE] bg-white hover:bg-[#00A2DE] hover:text-white transition-colors duration-200 py-2 text-base font-semibold flex-shrink-0">
          {t('profile.scoreDetails')}
        </button>
      </div>
    </article>
  );
};
