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
import { useQueryClient } from '@tanstack/react-query';
import { customInstance } from '../api/mutator/custom-instance';
import { handleAuthError } from '../api/auth';
import { useI18n } from "../i18n.tsx";
import { ACTION_BTN_STYLES, CARD_STYLES } from "../components/test/test.data.ts";
import { BackgroundWrapper } from "../components/BackgroundWrapper.tsx";
import { FaceMonitoring } from "../components/FaceMonitoring.tsx";
import { FadeIn, PageTransition } from "../components/animations";
import { useAuthStore } from "../stores/authStore";

type BuiltQuestion = {
  title: string;
  options: Option[];
  multiple: boolean;
  isOpen: boolean;
  choiceLetterToId: Record<string, number>;
  mediaUrl?: string;
  // Keep original question object so we can rebuild on language change
  sourceQuestion: any;
};


const TestPage: FC = () => {
  // Build questions dynamically from session/progress; cache loaded question details by order
  const [byOrder, setByOrder] = useState<Record<number, BuiltQuestion>>({});
  const [isExpired, setExpired] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [referenceDescriptor, setReferenceDescriptor] = useState<number[] | null>(null);

  useEffect(() => {
    try {
      const storedDescriptor = sessionStorage.getItem('faceReferenceDescriptor');
      if (storedDescriptor) {
        const parsed = JSON.parse(storedDescriptor);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReferenceDescriptor(parsed);
        }
      }
    } catch (error) {
      console.log('Failed to load cached face descriptor', error);
    }
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('faceReferenceDescriptor');
    };
  }, []);

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
  const hasCheckedVerificationRef = useRef(false); // Track if we've checked face verification
  const hasCheckedStatusRef = useRef(false); // Track if we've checked session status

  // Face monitoring state
  const [isFaceMonitoringActive, setIsFaceMonitoringActive] = useState(false);
  const [faceViolationCount, setFaceViolationCount] = useState(0);

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

  // Get real start time from API response
  const startedAtIso = (sessionData?.started_at ?? progressData?.session?.started_at) as string | undefined;
  const startedAtMs = useMemo(() => startedAtIso ? new Date(startedAtIso).getTime() : undefined, [startedAtIso]);

  useEffect(() => {
    if (!expiresAtMs) return;
    const now = Date.now();
    if (now >= expiresAtMs) {
      setExpired(true);
    }
  }, [expiresAtMs]);

  // No periodic refresh needed - only fetch when navigating or submitting answers

  // Check face verification completion before initializing test (only once)
  useEffect(() => {
    if (!sessionId || hasCheckedVerificationRef.current) return;

    const isFaceVerificationCompleted = sessionStorage.getItem(`faceVerificationCompleted_${sessionId}`) === 'true';

    if (!isFaceVerificationCompleted) {
      // Face verification not completed - redirect to profile
      console.log('Face verification not completed, redirecting to profile');
      hasCheckedVerificationRef.current = true;
      // Clear session data to prevent auto-redirect loop
      localStorage.removeItem('currentSurveySession');
      sessionStorage.removeItem(`faceVerificationCompleted_${sessionId}`);
      // Use window.location to break the React Router navigation cycle
      window.location.href = '/';
      return;
    }
  }, [sessionId, navigate]);

  // Check if session is already finished/completed/expired/cancelled (only once)
  useEffect(() => {
    if (!sessionId || hasCheckedStatusRef.current) return;
    // Wait for data to load
    if (sessionQuery.isLoading || progressQuery.isLoading) return;
    if (!sessionData && !progressData) return;

    const sessionStatus = sessionData?.status ?? progressData?.session?.status;
    const finishedStatuses = ['completed', 'expired', 'cancelled'];

    if (sessionStatus && finishedStatuses.includes(sessionStatus)) {
      console.log(`Session ${sessionId} is already ${sessionStatus}, redirecting to profile`);
      hasCheckedStatusRef.current = true;
      // Clear session data to prevent auto-redirect loop
      localStorage.removeItem('currentSurveySession');
      sessionStorage.removeItem(`faceVerificationCompleted_${sessionId}`);
      // Use window.location to break the React Router navigation cycle
      window.location.href = '/';
      return;
    }
  }, [sessionData, progressData, sessionId, navigate, sessionQuery.isLoading, progressQuery.isLoading]);

  // Initialize current order when session data becomes available (only once)
  useEffect(() => {
    if (!hasInitialized.current && current === null) {
      const sessionCurrentOrder = sessionData?.current_question?.order ?? progressData?.session?.current_question?.order;
      if (sessionCurrentOrder) {

        setCurrent(sessionCurrentOrder);
        hasInitialized.current = true;
      }
    }
  }, [sessionData, progressData, current]);

  // Start face monitoring when test begins (only if face verification was completed)
  useEffect(() => {
    if (current !== null && !isExpired && sessionId) {
      const isFaceVerificationCompleted = sessionStorage.getItem(`faceVerificationCompleted_${sessionId}`) === 'true';
      if (isFaceVerificationCompleted) {
        setIsFaceMonitoringActive(true);
      }
    }
  }, [current, isExpired, sessionId]);

  // Face monitoring handlers
  const handleFaceViolation = (violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched' | 'face_mismatch') => {

    setFaceViolationCount(prev => prev + 1);
  };

  const handleTestTermination = async () => {

    setIsFaceMonitoringActive(false);
    sessionStorage.removeItem('faceReferenceDescriptor');

    try {
      // Cancel the session
      await customInstance({
        method: 'POST',
        url: `/api/sessions/${sessionId}/cancel/`
      });

      // Clear session data
      localStorage.removeItem('currentSurveySession');

      // Navigate to profile with error message
      navigate('/profile?error=test_terminated');
    } catch (error) {

      navigate('/profile?error=test_terminated');
    }
  };

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

  function getLocalizedText(entity: any): string {
    if (!entity) return '';
    const byLang: Record<string, string | undefined> = {
      uz: entity.text_uz,
      'uz-cyrl': entity.text_uz_cyrl,
      ru: entity.text_ru,
    };
    const candidate = byLang[lang];
    return (
      (typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : undefined) ||
      (typeof entity.text === 'string' && entity.text.trim().length > 0 ? entity.text : undefined) ||
      entity.text_ru || entity.text_uz || entity.text_uz_cyrl || ''
    );
  }

  function buildQuestionFrom(qObj: any): BuiltQuestion {
    const q = qObj.question ?? qObj; // accept either wrapper or plain
    const isOpen = q.question_type === 'open';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const choiceLetterToId: Record<string, number> = {};
    const options: Option[] = isOpen ? [] : (q.choices ?? []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((c: any, idx: number) => {
      const key = letters[idx] ?? String(idx + 1);
      choiceLetterToId[key] = c.id;
      return { key, label: getLocalizedText(c) };
    });
    return {
      title: getLocalizedText(q),
      options,
      multiple: q.question_type === 'multiple',
      isOpen,
      choiceLetterToId,
      mediaUrl: q.image ?? undefined,
      sourceQuestion: qObj,
    };
  }

  // When language changes, rebuild the cached questions using their source
  useEffect(() => {
    setByOrder((prev) => {
      const next: Record<number, BuiltQuestion> = {};
      for (const [orderStr, built] of Object.entries(prev)) {
        const orderNum = Number(orderStr);
        const rebuilt = built?.sourceQuestion ? buildQuestionFrom(built.sourceQuestion) : built;
        next[orderNum] = rebuilt;
      }
      return next;
    });
  }, [lang]);

  // Use navigation endpoint data as primary source, fallback to session data
  const currentQuestion = currentQuestionFromNav ?? sessionData?.current_question ?? progressData?.session?.current_question;
  const order = currentQuestion?.order ?? current ?? 1;
  const built = byOrder[order];
  const selected = answers[order] || [];
  const textAnswer = textAnswers[order] || '';

  // Ensure we have valid values for ProgressBar
  const safeOrder = Math.max(order, 1);
  const safeTotal = Math.max(total, 1);

  // Prefetch next question for smoother navigation
  useEffect(() => {
    if (sessionId && navigationData?.has_next && navigationData.next_order) {
      const nextOrder = navigationData.next_order;

      // Only prefetch if we don't already have this question cached
      if (!byOrder[nextOrder]) {
        queryClient.prefetchQuery({
          queryKey: ['sessionsGetQuestionRetrieve', sessionId, { order: nextOrder }],
          queryFn: async () => {
            const response = await customInstance({
              method: 'GET',
              url: `/api/sessions/${sessionId}/get_question/`,
              params: { order: nextOrder }
            });
            return response;
          },
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        });
      }
    }

    // Also prefetch previous question for smoother backward navigation
    if (sessionId && navigationData?.has_previous && navigationData.previous_order) {
      const prevOrder = navigationData.previous_order;

      // Only prefetch if we don't already have this question cached
      if (!byOrder[prevOrder]) {
        queryClient.prefetchQuery({
          queryKey: ['sessionsGetQuestionRetrieve', sessionId, { order: prevOrder }],
          queryFn: async () => {
            const response = await customInstance({
              method: 'GET',
              url: `/api/sessions/${sessionId}/get_question/`,
              params: { order: prevOrder }
            });
            return response;
          },
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        });
      }
    }
  }, [sessionId, navigationData?.has_next, navigationData?.next_order, navigationData?.has_previous, navigationData?.previous_order, byOrder, queryClient]);

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

  // Violation limit kick-out disabled — detection only
  // const MAX_WARNING_ATTEMPTS = 8;
  // useEffect(() => {
  //   if (faceViolationCount >= MAX_WARNING_ATTEMPTS) {
  //     finishTest().then(() => {
  //       setFaceViolationCount(0);
  //     }).catch((error) => {
  //       console.error('Error finishing test:', error);
  //     });
  //   }
  // }, [faceViolationCount]);



  const [isFinishing, setIsFinishing] = useState(false);

  async function finishTest() {
    if (!sessionId) {
      alert('No active session to finish');
      return;
    }

    setIsFinishing(true);
    try {

      await finishSession.mutateAsync(sessionId);
      // Clean up and navigate to main page
      localStorage.removeItem('currentSurveySession');
      navigate('/');
    } catch (error) {

      // Check if it's an authentication error and handle it
      if (handleAuthError(error)) {
        return; // Already redirected to login
      }

      // Still navigate even if finish fails
      localStorage.removeItem('currentSurveySession');
      navigate('/');
    } finally {
      setIsFinishing(false);
    }
  }

  async function go(delta: number) {
    if (delta > 0) {
      // Submit current answer if we have one and session exists
      if (sessionId && hasAnswers && built) {
        // Use the question ID from the current question data (from get_question endpoint)
        const currentQuestionId = currentQuestionFromNav?.question?.id ?? currentQuestion?.question?.id;

        if (!currentQuestionId) {

          return;
        }

        const payload: any = {
          question_id: currentQuestionId
        };

        if (built.isOpen) {
          // For open-ended questions, submit text answer
          const trimmedAnswer = textAnswer.trim();
          if (trimmedAnswer.length === 0) {

            return;
          }
          payload.text_answer = trimmedAnswer;
        } else {
          // For multiple choice questions, submit choice IDs
          const choiceIds = selected.map((letter) => built.choiceLetterToId[letter]).filter(Boolean);
          if (choiceIds.length === 0) {

            return;
          }
          payload.choice_ids = choiceIds;
        }

        try {

          const res: any = await submitAnswer.mutateAsync({ sessionId, payload });

          // Check if this was the last question and if the session was automatically finished
          if (isLastQuestion) {
            // If final_score is present in the response, the session was automatically finished
            if (res?.final_score) {

              // Clean up and navigate to main page
              localStorage.removeItem('currentSurveySession');
              navigate('/');
              return;
            } else {
              // Manually finish the session if it wasn't automatically finished
              try {

                const finishRes = await finishSession.mutateAsync(sessionId);

                // Clean up and navigate to main page
                localStorage.removeItem('currentSurveySession');
                navigate('/');
                return;
              } catch (finishError) {

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


  return (
    <BackgroundWrapper>
      <PageTransition>
        <div className="space-y-4 relative py-4 md:p-6">

          {/* Progress Bar */}
          <FadeIn delay={100}>
            <ProgressBar
              title={getSurveyCategory(sessionData?.survey?.time_limit_minutes)}
              current={safeOrder}
              total={safeTotal}
              isFinishing={isFinishing}
              endTime={expiresAtMs}
              startTime={startedAtMs}
              timeLimitMinutes={sessionData?.survey?.time_limit_minutes}
              onExpire={() => setExpired(true)}
              onFinish={finishTest}
            />
          </FadeIn>

          {built ? (
            <FadeIn delay={200} direction="top">
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
            </FadeIn>
          ) : (
            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
              <div className="animate-pulse">
                {/* Question number skeleton */}
                <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>

                {/* Question title skeleton */}
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>

                {/* Answer options skeleton */}
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>

                {/* Loading text */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>{t('test.loadingQuestion')}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="relative">
            <div className={`${CARD_STYLES} !flex-row !py-6`}>
              <button
                onClick={() => setNavOpen((v) => !v)}
                className={ACTION_BTN_STYLES}>
                {t('test.questionOf', { current: safeOrder, total: safeTotal })}
                <img src="/icon/arrow-t.svg" alt="" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  disabled={isExpired || !navigationData?.has_previous}
                  onClick={() => go(-1)}
                  className={`${ACTION_BTN_STYLES} !bg-[#00A2DE] text-white`}>
                  <img src={'/icon/arrow-l-w.svg'} alt={'icon left'} />
                </button>
                <button
                  disabled={isExpired || !hasAnswers || isLoading}
                  onClick={() => go(1)}
                  onMouseEnter={() => {
                    // Prefetch next question on hover for even smoother experience
                    if (!isLastQuestion && sessionId && navigationData?.has_next && navigationData.next_order) {
                      const nextOrder = navigationData.next_order;
                      if (!byOrder[nextOrder]) {
                        queryClient.prefetchQuery({
                          queryKey: ['sessionsGetQuestionRetrieve', sessionId, { order: nextOrder }],
                          queryFn: async () => {
                            const response = await customInstance({
                              method: 'GET',
                              url: `/api/sessions/${sessionId}/get_question/`,
                              params: { order: nextOrder }
                            });
                            return response;
                          },
                          staleTime: 5 * 60 * 1000,
                          gcTime: 10 * 60 * 1000,
                        });
                      }
                    }
                  }}
                  className={`${ACTION_BTN_STYLES} !bg-[#00A2DE] text-white !text-base ${isExpired || !hasAnswers || isLoading ? 'opacity-50 !cursor-not-allowed' : ''}`}>
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className={'md:inline hidden'}>{isLastQuestion ? t('test.finish') : t('test.next')}</span>
                      {!isLastQuestion ? <img src={'/icon/arrow-r-w.svg'} alt={'icon left'} /> :
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7.24967 9.99999L9.08301 11.8333L12.7497 8.16666M19.1663 9.99999C19.1663 15.0626 15.0623 19.1667 9.99967 19.1667C4.93706 19.1667 0.833008 15.0626 0.833008 9.99999C0.833008 4.93738 4.93706 0.833328 9.99967 0.833328C15.0623 0.833328 19.1663 4.93738 19.1663 9.99999Z"
                            stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                    </>
                  )}
                </button>
              </div>
            </div>

            <QuestionNavigator
              total={safeTotal}
              currentIndex={Math.max(safeOrder - 1, 0)} // Convert order to zero-based index for navigator
              answered={answeredFlags}
              open={navOpen}
              onClose={() => setNavOpen(false)}
              onSelect={(i) => setCurrent(i + 1)} // Convert zero-based index back to order
              variant="popup"
            />

            {/* Docked or second navigator removed */}
          </div>
        </div>
      </PageTransition>

      {/* Face Monitoring Component */}
      <FaceMonitoring
        isActive={isFaceMonitoringActive}
        sessionId={sessionId || ''}
        userId={user?.id?.toString()}
        onViolation={handleFaceViolation}
        onTestTerminated={handleTestTermination}
        checkInterval={3000}
        referenceDescriptor={referenceDescriptor}
      />
    </BackgroundWrapper>
  );
};

export default TestPage


