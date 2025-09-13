import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { type Option, ProgressBar, QuestionCard, QuestionNavigator } from '../components/test';
import {
  useFinishSession,
  useGetQuestion,
  useSessionDetails,
  useSessionProgress,
  useSubmitAnswer
} from '../api/surveys';
import { handleAuthError } from '../api/auth';
import { useI18n } from "../i18n.tsx";
import { ACTION_BTN_STYLES, CARD_STYLES } from "../components/test/test.data.ts";

type BuiltQuestion = {
  title: string;
  options: Option[];
  multiple: boolean;
  isOpen: boolean;
  choiceLetterToId: Record<string, number>;
  mediaUrl?: string;
};


const TestPage: FC = () => {
  // Build questions dynamically from session/progress; cache loaded question details by order
  const [byOrder, setByOrder] = useState<Record<number, BuiltQuestion>>({});
  const [isExpired, setExpired] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  // Function to determine survey category based on survey data
  const getSurveyCategory = (surveyData: any): string => {
    if (!surveyData) return t('progress.mainQuestions');

    const title = surveyData.title || '';
    const description = surveyData.description || '';
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('iq') || text.includes('айкью')) {
      return t('progress.iqQuestions');
    } else if (text.includes('дополнительн') || text.includes('qo\'shimcha')) {
      return t('progress.additionalQuestions');
    } else if (text.includes('газ') || text.includes('gaz') || text.includes('региональн') || text.includes('hududiy')) {
      return t('progress.regionalGasSupply');
    } else {
      return t('progress.mainQuestions');
    }
  };

  // Get sessionId from URL params or localStorage
  const sessionId = useMemo(() => {
    // First try URL params
    const urlSessionId = searchParams.get('sessionId');
    if (urlSessionId) {
      return urlSessionId;
    }

    // Fallback to localStorage
    try {
      const session = JSON.parse(localStorage.getItem('currentSurveySession') || 'null');
      return session?.id as string | undefined;
    } catch {
      return undefined;
    }
  }, [searchParams]);

  // Use session details endpoint when we have a sessionId, fallback to progress endpoint
  const sessionQuery = useSessionDetails(sessionId);
  const progressQuery = useSessionProgress(sessionId);

  // Prefer session details data over progress data
  const sessionData = sessionQuery.data as any;

  const progressData = progressQuery.data as any;

  const total = sessionData?.progress?.total_questions ?? progressData?.progress?.total_questions ?? 0;

  const [current, setCurrent] = useState<number | null>(null); // Will be set when session data loads
  const [answers, setAnswers] = useState<Record<number, string[]>>({}); // key: order → selected letters
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({}); // key: order → text answer
  const submitAnswer = useSubmitAnswer();
  const finishSession = useFinishSession();
  const [navOpen, setNavOpen] = useState(false);
  const hasInitialized = useRef(false); // Track if we've already initialized the current order

  // Get current question using the navigation endpoint - only call when we have valid data
  const questionQuery = useGetQuestion(sessionId, current ?? undefined);

  // Get question data from the navigation endpoint
  const questionData = questionQuery.data as any;
  const currentQuestionFromNav = questionData?.question;
  const navigationData = questionData?.navigation;
  const existingAnswer = questionData?.answer;

  // Handle loading and error states
  const isLoading = sessionQuery.isLoading || progressQuery.isLoading || questionQuery.isLoading;
  const hasError = sessionQuery.error || progressQuery.error || questionQuery.error;

  // Handle authentication errors from session queries
  useEffect(() => {
    const errors = [sessionQuery.error, progressQuery.error, questionQuery.error];
    for (const error of errors) {
      if (error && handleAuthError(error)) {
        return; // Already redirected to login
      }
    }
  }, [sessionQuery.error, progressQuery.error, questionQuery.error]);

  // drive timer/expiration from API response
  const expiresAtIso = (sessionData?.expires_at ?? progressData?.session?.expires_at) as string | undefined;
  const expiresAtMs = useMemo(() => expiresAtIso ? new Date(expiresAtIso).getTime() : undefined, [expiresAtIso]);

  useEffect(() => {
    if (!expiresAtMs) return;
    const now = Date.now();
    if (now >= expiresAtMs) {
      setExpired(true);
    }
  }, [expiresAtMs]);

  // No periodic refresh needed - only fetch when navigating or submitting answers


  // Initialize current order when session data becomes available (only once)
  useEffect(() => {
    if (!hasInitialized.current && current === null) {
      const sessionCurrentOrder = sessionData?.current_question?.order ?? progressData?.session?.current_question?.order;
      if (sessionCurrentOrder) {
        console.log('Initializing current order to:', sessionCurrentOrder);
        setCurrent(sessionCurrentOrder);
        hasInitialized.current = true;
      }
    }
  }, [sessionData, progressData, current]);

  // When expired, cleanup and push to profile
  useEffect(() => {
    if (isExpired) {
      localStorage.removeItem('currentSurveySession');
      navigate('/');
    }
  }, [isExpired, navigate]);

  // Initialize questions from navigation endpoint or fallback sources
  useEffect(() => {
    // First try navigation endpoint data
    if (currentQuestionFromNav && !byOrder[currentQuestionFromNav.order]) {
      const built = buildQuestionFrom(currentQuestionFromNav);
      setByOrder((prev) => ({ ...prev, [currentQuestionFromNav.order]: built }));

      // Load existing answer if available
      if (existingAnswer) {
        if (built.isOpen && existingAnswer.text_answer) {
          setTextAnswers((prev) => ({ ...prev, [currentQuestionFromNav.order]: existingAnswer.text_answer }));
        } else if (existingAnswer.choice_ids && existingAnswer.choice_ids.length > 0) {
          // Convert choice IDs back to letters
          const letters = Object.keys(built.choiceLetterToId).filter(letter =>
            existingAnswer.choice_ids.includes(built.choiceLetterToId[letter])
          );
          setAnswers((prev) => ({ ...prev, [currentQuestionFromNav.order]: letters }));
        }
      }
      return;
    }

    // Fallback to session data
    const currentQ = sessionData?.current_question;
    if (currentQ && !byOrder[currentQ.order]) {
      const built = buildQuestionFrom(currentQ);
      setByOrder((prev) => ({ ...prev, [currentQ.order]: built }));
      setCurrent(currentQ.order);
      return;
    }

    // Final fallback to localStorage
    try {
      const storedSession = JSON.parse(localStorage.getItem('currentSurveySession') || 'null');
      const startQ = (storedSession as any)?.current_question;
      if (startQ && !byOrder[startQ.order]) {
        const built = buildQuestionFrom(startQ);
        setByOrder((prev) => ({ ...prev, [startQ.order]: built }));
        setCurrent(startQ.order);
      }
    } catch {
      // Ignore parsing errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionFromNav, existingAnswer, sessionData, sessionId]);

  function buildQuestionFrom(qObj: any): BuiltQuestion {
    const q = qObj.question ?? qObj; // accept either wrapper or plain
    const isOpen = q.question_type === 'open';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const choiceLetterToId: Record<string, number> = {};
    const options: Option[] = isOpen ? [] : (q.choices ?? []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((c: any, idx: number) => {
      const key = letters[idx] ?? String(idx + 1);
      choiceLetterToId[key] = c.id;
      return { key, label: c.text };
    });
    return {
      title: q.text,
      options,
      multiple: q.question_type === 'multiple',
      isOpen,
      choiceLetterToId,
      mediaUrl: q.image ?? undefined
    };
  }

  // Use navigation endpoint data as primary source, fallback to session data
  const currentQuestion = currentQuestionFromNav ?? sessionData?.current_question ?? progressData?.session?.current_question;
  const order = currentQuestion?.order ?? current ?? 1;
  const built = byOrder[order];
  const selected = answers[order] || [];
  const textAnswer = textAnswers[order] || '';

  // Check if current question has any answers selected
  const hasAnswers = built?.isOpen ? textAnswer.trim().length > 0 : selected.length > 0;

  // Check if this is the last question
  const isLastQuestion = !navigationData?.has_next || order === total;

  function toggleOption(key: string) {
    setAnswers((prev) => {
      const cur = prev[order] || [];
      const next = (built?.multiple ?? false)
        ? cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]
        : [key];
      return { ...prev, [order]: next };
    });
  }

  function handleTextChange(value: string) {
    setTextAnswers((prev) => ({ ...prev, [order]: value }));
  }

  async function finishTest() {
    if (!sessionId) return;

    try {
      console.log('Manually finishing session:', sessionId);
      const finishRes = await finishSession.mutateAsync(sessionId);
      console.log('Manual finish response:', finishRes);

      // Clean up and navigate to main page
      localStorage.removeItem('currentSurveySession');
      navigate('/');
    } catch (error) {
      console.error('Manual finish error:', error);

      // Check if it's an authentication error and handle it
      if (handleAuthError(error)) {
        return; // Already redirected to login
      }

      // Still navigate even if finish fails
      localStorage.removeItem('currentSurveySession');
      navigate('/');
    }
  }

  async function go(delta: number) {
    if (delta > 0) {
      // Submit current answer if we have one and session exists
      if (sessionId && hasAnswers && built) {
        // Use the question ID from the current question data (from get_question endpoint)
        const currentQuestionId = currentQuestionFromNav?.question?.id ?? currentQuestion?.question?.id;

        if (!currentQuestionId) {
          console.error('No question ID found for submission');
          return;
        }

        const payload: any = {
          question_id: currentQuestionId
        };

        if (built.isOpen) {
          // For open-ended questions, submit text answer
          const trimmedAnswer = textAnswer.trim();
          if (trimmedAnswer.length === 0) {
            console.error('Empty text answer');
            return;
          }
          payload.text_answer = trimmedAnswer;
        } else {
          // For multiple choice questions, submit choice IDs
          const choiceIds = selected.map((letter) => built.choiceLetterToId[letter]).filter(Boolean);
          if (choiceIds.length === 0) {
            console.error('No valid choice IDs');
            return;
          }
          payload.choice_ids = choiceIds;
        }

        try {
          console.log('Submitting answer:', { sessionId, payload });
          const res: any = await submitAnswer.mutateAsync({ sessionId, payload });
          console.log('Submit response:', res);

          // Check if this was the last question and if the session was automatically finished
          if (isLastQuestion) {
            // If final_score is present in the response, the session was automatically finished
            if (res?.final_score) {
              console.log('Session automatically finished by submit_answer');
              // Clean up and navigate to main page
              localStorage.removeItem('currentSurveySession');
              navigate('/');
              return;
            } else {
              // Manually finish the session if it wasn't automatically finished
              try {
                console.log('Manually finishing session:', sessionId);
                const finishRes = await finishSession.mutateAsync(sessionId);
                console.log('Finish response:', finishRes);

                // Clean up and navigate to main page
                localStorage.removeItem('currentSurveySession');
                navigate('/');
                return;
              } catch (finishError) {
                console.error('Finish session error:', finishError);

                // Check if it's an authentication error and handle it
                if (handleAuthError(finishError)) {
                  return; // Already redirected to login
                }

                // Still try to navigate even if finish fails
                localStorage.removeItem('currentSurveySession');
                navigate('/');
                return;
              }
            }
          }

          // Update navigation based on response (for non-last questions)
          if (res?.session?.current_question) {
            const nextQ = res.session.current_question;
            if (nextQ.order) {
              const bq = buildQuestionFrom(nextQ);
              setByOrder((prev) => ({ ...prev, [nextQ.order]: bq }));
              setCurrent(nextQ.order);
            }
          }

          // Refresh data
          await sessionQuery.refetch();
          await progressQuery.refetch();
        } catch (error) {
          console.error('Submit answer error:', error);

          // Check if it's an authentication error and handle it
          if (handleAuthError(error)) {
            return; // Already redirected to login
          }

          // Don't proceed if submission failed
          return;
        }
      }
    }

    // Update current based on navigation data (for backward navigation or when no submission needed)
    if (navigationData) {
      if (delta > 0 && navigationData.has_next && navigationData.next_order) {
        setCurrent(navigationData.next_order);
      } else if (delta < 0 && navigationData.has_previous && navigationData.previous_order) {
        setCurrent(navigationData.previous_order);
      }
    }
  }

  const questionsData = progressData?.questions ?? [];
  const answeredFlags = Array.from({ length: Math.max(total, 0) }).map((_, i) => !!answers[i + 1]?.length || !!questionsData[i]?.is_answered);


  // Show error state
  if (hasError) {
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
            {t('error.testData')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading || current === null) {
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('loading.test')}</h2>
          <p className="text-gray-600">
            {t('loading.testDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative py-4">
      {/* Debug panel - remove in production */}
      {/*{process.env.NODE_ENV === 'development' && (*/}
      {/*  <div className="bg-gray-100 p-4 rounded-lg text-xs">*/}
      {/*    <div><strong>Debug Info:</strong></div>*/}
      {/*    <div>Current Order: {current}</div>*/}
      {/*    <div>Session ID: {sessionId}</div>*/}
      {/*    <div>Question ID: {currentQuestionFromNav?.question?.id}</div>*/}
      {/*    <div>Navigation: {JSON.stringify(navigationData)}</div>*/}
      {/*    <div>Has Answers: {hasAnswers}</div>*/}
      {/*    <div>Selected: {JSON.stringify(selected)}</div>*/}
      {/*    <div>Text Answer: {textAnswer}</div>*/}
      {/*    <div>Is Last Question: {isLastQuestion}</div>*/}
      {/*    <div>Expires At: {expiresAtIso}</div>*/}
      {/*    <div>Expires At Ms: {expiresAtMs}</div>*/}
      {/*    <div>Time*/}
      {/*      Remaining: {expiresAtMs ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000 / 60)) : 'N/A'} minutes*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* Progress Bar */}
      <ProgressBar
        title={getSurveyCategory(sessionData?.survey?.time_limit_minutes)}
        current={order}
        total={total}
        endTime={expiresAtMs}
        timeLimitMinutes={sessionData?.survey?.time_limit_minutes}
        onExpire={() => setExpired(true)}
        onFinish={finishTest}
      />

      {built ? (
        <QuestionCard
          index={order}
          title={built.title}
          options={built.options}
          selectedKeys={selected}
          multiple={built.multiple}
          isOpen={built.isOpen}
          textAnswer={textAnswer}
          onToggle={toggleOption}
          onTextChange={handleTextChange}
          media={built.mediaUrl ? (
            <div className="aspect-video mb-4 md:mb-0 w-full h-full rounded-xl overflow-hidden bg-gray-100">
              <img
                src={built.mediaUrl}
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = '/test-image.png';
                }}
                className="h-full w-full object-cover"
                alt="media"
              /></div>
          ) : null}
        />
      ) : (
        <section
          className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">{t('test.loadingQuestion')}</section>
      )}

      <div className="relative">
        <div className={`${CARD_STYLES} !flex-row !py-6`}>
          <button
            onClick={() => setNavOpen((v) => !v)}
            className={ACTION_BTN_STYLES}>
            {t('test.questionOf', { current: order, total })}
            <img src="/icon/arrow-t.svg" alt="" />
          </button>
          <div className="flex items-center gap-2">
            <button
              disabled={isExpired || !navigationData?.has_previous}
              onClick={() => go(-1)}
              className={ACTION_BTN_STYLES}>
              <img src={'/icon/arrow-l.svg'} alt={'icon left'} />
            </button>
            <button
              disabled={isExpired || !hasAnswers}
              onClick={() => go(1)}
              className={`${ACTION_BTN_STYLES} !text-[#00A2DE] !text-base ${isExpired || !hasAnswers ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isLastQuestion ? t('test.finish') : t('test.next')}
              {!isLastQuestion && <img src={'/icon/arrow-r.svg'} alt={'icon left'} />}
            </button>
          </div>
        </div>

        <QuestionNavigator
          total={total}
          currentIndex={Math.max(order - 1, 0)} // Convert order to zero-based index for navigator
          answered={answeredFlags}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onSelect={(i) => setCurrent(i + 1)} // Convert zero-based index back to order
          variant="popup"
        />

        {/* Docked or second navigator removed */}
      </div>
    </div>
  );
};

export default TestPage


