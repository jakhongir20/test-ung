import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSessionsAllAnswersRetrieve, useSessionsRetrieve } from '../api/generated/respondentWebAPI';
import { handleAuthError } from '../api/auth';

const SessionDetailsPage: FC = () => {
  const {t} = useI18n();
  const {id} = useParams<{ id: string; }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch session details
  const sessionQuery = useSessionsRetrieve(id || '', {
    query: {
      enabled: !!id,
      retry: 1,
      retryDelay: 1000
    }
  });

  // Fetch all answers
  const answersQuery = useSessionsAllAnswersRetrieve(id || '', {
    query: {
      enabled: !!id,
      retry: 1,
      retryDelay: 1000
    }
  });

  // Handle authentication errors
  useEffect(() => {
    if ((sessionQuery.error && handleAuthError(sessionQuery.error)) ||
      (answersQuery.error && handleAuthError(answersQuery.error))) {
      return; // Already redirected to login
    }
  }, [sessionQuery.error, answersQuery.error]);

  // Loading state
  if (sessionQuery.isLoading || answersQuery.isLoading) {
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
  if (sessionQuery.error || answersQuery.error) {
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
            onClick={() => {
              sessionQuery.refetch();
              answersQuery.refetch();
            }}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const answers = answersQuery.data;
  const questions = answers?.questions || [];

  // Calculate statistics
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(q => q.answer && q.answer.is_correct).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  // Pagination
  const totalPages = Math.ceil(totalQuestions / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);

  const getAnswerStatus = (question: any) => {
    if (!question.answer) return {status: 'incorrect', text: t('session.incorrect')};
    const isCorrect = question.answer.is_correct;
    return {
      status: isCorrect ? 'correct' : 'incorrect',
      text: isCorrect ? t('session.correct') : t('session.incorrect')
    };
  };

  const getAnswerLetter = (answer: any, question: any) => {
    if (!answer) return '-';

    // For single choice questions
    if (answer.selected_choices && answer.selected_choices.length > 0) {
      const selectedChoice = answer.selected_choices[0];
      const choiceIndex = question.question.choices?.findIndex((c: any) => c.id === selectedChoice.id);
      return String.fromCharCode(65 + choiceIndex); // A, B, C, D
    }

    // For multiple choice questions
    if (answer.selected_choices && answer.selected_choices.length > 1) {
      const selectedLetters = answer.selected_choices.map((choice: any) => {
        const choiceIndex = question.question.choices.findIndex((c: any) => c.id === choice.id);
        return String.fromCharCode(65 + choiceIndex);
      });
      return selectedLetters.join(', ');
    }

    // For open text questions
    if (answer.text_answer) {
      return answer.text_answer.substring(0, 20) + (answer.text_answer.length > 20 ? '...' : '');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Score Details Banner */}
      <div className="bg-[#00A2DE] text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full opacity-100">
          <img className="h-full object-cover" src="/bg/profile-bg.png" alt="bg"/>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-wider">
            {t('session.scoreDetails')}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            {t('session.scoreDetailsDesc')}
          </p>
        </div>
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl"/>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Test Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('session.testNumber', {number: 1})}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('session.testDesc')}
          </p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-[#00A2DE] mb-2">
                {totalQuestions}
              </div>
              <div className="text-gray-700 font-medium">
                {t('session.totalQuestions')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {correctAnswers}
              </div>
              <div className="text-gray-700 font-medium">
                {t('session.correctAnswers')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {incorrectAnswers}
              </div>
              <div className="text-gray-700 font-medium">
                {t('session.incorrectAnswers')}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {t('session.questions')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {t('session.questionTitle')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {t('session.correctAnswer')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {t('session.yourAnswer')}
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {currentQuestions.map((question, index) => {
                const answerStatus = getAnswerStatus(question);
                const questionNumber = startIndex + index + 1;

                return (
                  <tr key={questionNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {questionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      <div className="truncate">
                        {(question.question?.question as any)?.text || `Question ${questionNumber}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCorrectAnswerLetter(question)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {getAnswerLetter(question.answer, question)}
                          </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${answerStatus.status === 'correct'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                            {answerStatus.text}
                          </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{t('session.pageNumber')}</span>
              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#00A2DE] focus:border-transparent"
                min="1"
                max={totalPages}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt; {t('session.previous')}
              </button>

              <div className="flex gap-1">
                {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded ${currentPage === pageNum
                        ? 'bg-[#00A2DE] text-white'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="px-2 py-2 text-sm text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('session.next')} &gt;
              </button>
            </div>

            <div className="text-sm text-gray-700">
              {t('session.results', {
                showing: `${itemsPerPage}`,
                total: totalQuestions
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsPage;
