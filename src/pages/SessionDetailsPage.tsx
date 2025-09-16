import type { FC } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { handleAuthError } from '../api/auth';
import { useModeratorUserSessionDetails } from '../api/moderator';
import { MyProfileBanner } from "../components/MyProfileBanner.tsx";
import type { Column } from "../components/DataTable.tsx";
import { DataTable } from "../components/DataTable.tsx";
import { CARD_STYLES } from "../components/test/test.data.ts";
import { StatusBadge } from "../components/StatusBadge.tsx";

const SessionDetailsPage: FC = () => {
  const { t } = useI18n();
  const { id } = useParams<{ id: string; }>();

  // Fetch session details with new API
  const sessionQuery = useModeratorUserSessionDetails(id);

  // Handle authentication errors
  useEffect(() => {
    if (sessionQuery.error && handleAuthError(sessionQuery.error)) {
      return; // Already redirected to login
    }
  }, [sessionQuery.error]);

  // Loading state
  if (sessionQuery.isLoading) {
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('loading.sessionDetails')}</h2>
          <p className="text-gray-600">
            {t('loading.sessionDetailsDesc')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionQuery.error) {
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
            onClick={() => {
              sessionQuery.refetch();
            }}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const sessionData = sessionQuery.data as any;
  const session = sessionData?.session;
  const questions = sessionData?.questions || [];

  // Calculate statistics
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter((q: any) => q.answer && q.answer.is_correct).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  // Use session data for additional statistics
  const sessionPercentage = session?.percentage || 0;

  const getAnswerStatus = (question: any) => {
    if (!question.answer) return { status: 'incorrect', text: t('session.incorrect') };
    const isCorrect = question.answer.is_correct;
    return {
      status: isCorrect ? 'correct' : 'incorrect',
      text: isCorrect ? t('session.correct') : t('session.incorrect')
    };
  };

  const getAnswerLetter = (answer: any, question: any) => {
    if (!answer) return '-';

    // For open text questions - check text_answer first
    if (answer.text_answer && answer.text_answer.trim() !== '') {
      return answer.text_answer.substring(0, 20) + (answer.text_answer.length > 20 ? '...' : '');
    }

    // For single choice questions - use selected_choices[0]?.text if available
    if (answer.selected_choices && answer.selected_choices.length > 0) {
      const selectedChoice = answer.selected_choices[0];

      // If selected_choices[0] has text, use it
      if (selectedChoice.text && selectedChoice.text.trim() !== '') {
        return selectedChoice.text;
      }

      // Fallback to letter index
      const choiceIndex = question.question.choices?.findIndex((c: any) => c.id === selectedChoice.id);
      return String.fromCharCode(65 + choiceIndex); // A, B, C, D
    }

    // For multiple choice questions
    if (answer.selected_choices && answer.selected_choices.length > 1) {
      const selectedTexts = answer.selected_choices.map((choice: any) => {
        // Use text if available, otherwise use letter index
        if (choice.text && choice.text.trim() !== '') {
          return choice.text;
        }
        const choiceIndex = question.question.choices.findIndex((c: any) => c.id === choice.id);
        return String.fromCharCode(65 + choiceIndex);
      });
      return selectedTexts.join(', ');
    }

    return '-';
  };

  const getCorrectAnswerLetter = (question: any) => {
    // For single choice questions, we need to find the correct choice
    if (question.question.question_type === 'single') {
      // Since we don't have explicit correct choice in the response,
      // we'll show the first choice as a placeholder
      // In a real implementation, you'd need the correct answer from the question data
      return 'A';
    }

    // For multiple choice questions
    if (question.question.question_type === 'multiple') {
      // Similar to single choice, would need correct answers from question data
      return 'A, B';
    }

    // For open questions
    if (question.question.question_type === 'open') {
      return 'Text';
    }

    return 'A';
  };

  // Define table columns
  const columns: Column[] = [
    {
      key: 'order',
      title: t('session.questions'),
      className: 'whitespace-nowrap font-medium',
      sortable: true
    },
    {
      key: 'questionText',
      title: t('session.questionTitle'),
      className: 'max-w-md',
      render: (_, question) => (
        <div className="truncate">
          {(question.question?.question as any)?.text || `Question ${question.order}`}
        </div>
      )
    },
    {
      key: 'answerStatus',
      title: t('session.status'),
      className: 'whitespace-nowrap',
      render: (_, question) => {
        const answerStatus = getAnswerStatus(question);
        return <StatusBadge status={answerStatus.status} />;
      }
    },
    {
      key: 'yourAnswer',
      title: t('session.yourAnswer'),
      className: 'whitespace-nowrap',
      render: (_, question) => {
        const answerStatus = getAnswerStatus(question);
        const answerText = getAnswerLetter(question.answer, question);

        return (
          <div className="flex items-center">
            {answerStatus.status === 'correct' ? (
              <span className="font-medium">
                {answerText}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      }
    }
  ];

  // Prepare data for the table
  const tableData = questions.map((question: any, index: number) => ({
    ...question,
    order: index + 1,
    questionText: (question.question?.question)?.text || `Question ${index + 1}`,
    correctAnswer: getCorrectAnswerLetter(question),
    yourAnswer: getAnswerLetter(question.answer, question)
  }));

  return (
    <div className="min-h-screen ">
      <MyProfileBanner title={t('session.scoreDetails')} description={t('session.scoreDetailsDesc')} />
      <br />
      <div className={CARD_STYLES}>
        <div className="">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('session.testNumber', { number: 1 })}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('session.testDesc')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                value: totalQuestions,
                label: t('session.totalQuestions'),
                color: 'text-[#00A2DE]'
              },
              {
                value: correctAnswers,
                label: t('session.correctAnswers'),
                color: 'text-green-600'
              },
              {
                value: incorrectAnswers,
                label: t('session.incorrectAnswers'),
                color: 'text-red-600'
              },
              {
                value: `${sessionPercentage}%`,
                label: t('session.scorePercentage'),
                color: 'text-purple-600'
              }
            ].map((stat, idx) => (
              <div className={'bg-white border border-[#E2E8F0] rounded-xl p-6'} key={idx}>
                <div className={`text-3xl font-medium mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-[#334155] text-[18px] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div className={'w-full my-4 md:my-7 h-[1px] bg-[#E2E8F0]'}></div>
        </div>
        <DataTable
          data={tableData}
          columns={columns}
          itemsPerPage={10}
          showPagination={true}
          emptyMessage={t('session.noQuestions')}
        />
      </div>
    </div>
  );
};

export default SessionDetailsPage;
