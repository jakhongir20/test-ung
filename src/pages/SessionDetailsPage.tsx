import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { handleAuthError } from '../api/auth';
import { useModeratorUserSessionDetails } from '../api/moderator';
import { useModeratorUsersSessionViolationsRetrieve, useUsersMeRetrieve } from '../api/generated/respondentWebAPI';
import { MyProfileBanner } from "../components/MyProfileBanner.tsx";
import type { Column } from "../components/DataTable.tsx";
import { DataTable } from "../components/DataTable.tsx";
import { CARD_STYLES } from "../components/test/test.data.ts";
import { StatusBadge } from "../components/StatusBadge.tsx";
import { BackgroundWrapper } from "../components/BackgroundWrapper.tsx";
import UserSessionDetailsPage from './UserSessionDetailsPage';
import { useQuery } from '@tanstack/react-query';
import { customInstance } from '../api/mutator/custom-instance';
import Hls from 'hls.js';

type TabType = 'results' | 'violations';

interface ViolationData {
  id: number;
  timestamp: string;
  violation_type: string;
  face_count: number;
  snapshot_url: string;
}

interface RecordingData {
  session_id: string;
  recording: {
    playlist_url: string;
    video_file_url: string;
    duration_seconds: number;
    file_size: number;
    processed: boolean;
  } | null;
  chunks: Array<{
    chunk_number: number;
    video_url: string;
    duration_seconds: number;
    start_time: number;
    end_time: number;
  }>;
}

const HlsVideoPlayer: FC<{ playlistUrl: string; fallbackMessage: string; className?: string; }> = ({
  playlistUrl,
  fallbackMessage,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let hls: Hls | null = null;

    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = playlistUrl;
      setIsSupported(true);
    } else if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(playlistUrl);
      hls.attachMedia(videoElement);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [playlistUrl]);

  if (!isSupported) {
    return <div className="text-center text-gray-600 text-sm">{fallbackMessage}</div>;
  }

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className={className}
    />
  );
};

const SessionDetailsPage: FC = () => {
  const { t, lang } = useI18n();
  const { id } = useParams<{ id: string; }>();
  const userQuery = useUsersMeRetrieve();
  const [activeTab, setActiveTab] = useState<TabType>('results');

  const sessionQuery = useModeratorUserSessionDetails(id);

  // Fetch violations data
  const violationsQuery = useModeratorUsersSessionViolationsRetrieve(id || '', {
    query: {
      enabled: !!id && activeTab === 'violations',
    }
  });

  // Fetch recording data
  const recordingQuery = useQuery({
    queryKey: ['session-recording', id],
    queryFn: async () => {
      if (!id) return null;
      return customInstance<RecordingData>({
        method: 'GET',
        url: `/api/moderator/users/session/${id}/recording/`,
      });
    },
    enabled: !!id && activeTab === 'violations',
  });

  console.log('recordingQuery data', recordingQuery.data);

  useEffect(() => {
    if (sessionQuery.error && handleAuthError(sessionQuery.error)) {
      return; // Already redirected to login
    }
  }, [sessionQuery.error]);

  // If user is not a moderator (based on users/me), redirect to user session details page
  if (userQuery.data && !userQuery.data.is_moderator) {
    return <UserSessionDetailsPage />;
  }

  // Fetch session details with moderator API

  // Handle authentication errors

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
  const userData = userQuery.data as any;
  const questions = sessionData?.questions || [];

  // Calculate statistics
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter((q: any) => q.answer && q.answer.is_correct).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getAnswerStatus = (question: any) => {
    if (!question.answer) return { status: 'incorrect', text: t('session.incorrect') };
    const isCorrect = question.answer.is_correct;
    return {
      status: isCorrect ? 'correct' : 'incorrect',
      text: isCorrect ? t('session.correct') : t('session.incorrect')
    };
  };

  const getLocalizedText = (entity: any): string => {
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

      // If selected choice has text, use localized version
      const localized = getLocalizedText(selectedChoice);
      if (localized && localized.trim() !== '') {
        return localized;
      }

      // Fallback to letter index
      const choiceIndex = question.question.choices?.findIndex((c: any) => c.id === selectedChoice.id);
      return String.fromCharCode(65 + choiceIndex); // A, B, C, D
    }

    // For multiple choice questions
    if (answer.selected_choices && answer.selected_choices.length > 1) {
      const selectedTexts = answer.selected_choices.map((choice: any) => {
        // Use localized text if available, otherwise use letter index
        const localized = getLocalizedText(choice);
        if (localized && localized.trim() !== '') return localized;
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

  const getViolationTypeLabel = (type: string) => {
    const normalized = type.toLowerCase();
    const translationKey = `session.violationType.${normalized}`;
    return t(translationKey);
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
      render: (_, question) => {
        const q = question?.question;
        const text = q ? getLocalizedText(q) : `Question ${question.order}`;
        return (
          <div className="truncate">
            {text}
          </div>
        );
      }
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
    },
    // {
    //   key: 'yourAnswer',
    //   title: t('session.yourAnswer'),
    //   className: 'whitespace-nowrap',
    //   render: (_, question) => {
    //     debugger
    //     const yourAnswer = getAnswerLetter(question.answer, question);
    //     return (
    //       <div className="truncate">
    //         {yourAnswer}
    //       </div>
    //     );
    //   }
    // }
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
    <BackgroundWrapper>
      <div className="min-h-screen md:p-6">
        <MyProfileBanner title={t('session.scoreDetails')} description={t('session.scoreDetailsDesc')} />
        <br />
        <div className={CARD_STYLES}>
          <div className="">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {userData?.name
                ? t('session.personalizedGreeting', {
                  name: userData.name,
                  score: correctAnswers
                })
                : t('session.testDesc')
              }
            </h2>
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
                  value: correctAnswers,
                  label: t('session.scorePoints'),
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

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'results'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {t('session.testResults')}
              </button>
              <button
                onClick={() => setActiveTab('violations')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'violations'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {t('session.violationCases')}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'results' && (
              <DataTable
                data={tableData}
                columns={columns}
                itemsPerPage={10}
                showPagination={true}
                emptyMessage={t('session.noQuestions')}
              />
            )}

            {activeTab === 'violations' && (
              <div className="space-y-6">
                {/* Recording Section */}
                {recordingQuery.data && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('session.recordingTitle')}</h3>

                    {recordingQuery.data.recording && recordingQuery.data.recording.processed ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">{t('session.duration')}</p>
                              <p className="text-lg font-medium">
                                {Math.floor(recordingQuery.data.recording.duration_seconds / 60)}:{(recordingQuery.data.recording.duration_seconds % 60).toString().padStart(2, '0')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{t('session.fileSize')}</p>
                              <p className="text-lg font-medium">
                                {(recordingQuery.data.recording.file_size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </div>

                        {recordingQuery.data.recording.video_file_url ? (
                          <video
                            controls
                            className="w-full rounded-lg bg-black"
                            src={recordingQuery.data.recording.video_file_url}
                          >
                            Your browser does not support video playback.
                          </video>
                        ) : recordingQuery.data.recording.playlist_url ? (
                          <HlsVideoPlayer
                            playlistUrl={recordingQuery.data.recording.playlist_url}
                            fallbackMessage={t('session.recordingUnavailable')}
                            className="w-full rounded-lg bg-black"
                          />
                        ) : (
                          <div className="text-center text-gray-600 text-sm">
                            {t('session.recordingUnavailable')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-600 text-sm">
                        {t('session.recordingProcessing')}
                      </div>
                    )}
                  </div>
                )}

                {/* Violations Section */}
                {violationsQuery.data && (violationsQuery.data as ViolationData[]).length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('session.violationsTitle')}</h3>
                    <div className="space-y-4">
                      {(violationsQuery.data as ViolationData[]).map((violation) => (
                        <div key={violation.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Snapshot */}
                            {violation.snapshot_url && (
                              <div className="flex-shrink-0">
                                <img
                                  src={violation.snapshot_url}
                                  alt={`Violation ${violation.id}`}
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                />
                              </div>
                            )}

                            {/* Violation Details */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium uppercase tracking-wide">
                                  {getViolationTypeLabel(violation.violation_type)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(violation.timestamp).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">{t('session.faceCount')}:</span>
                                  <span className="ml-2 font-medium">{violation.face_count}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">{t('session.violationId')}:</span>
                                  <span className="ml-2 font-medium">#{violation.id}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('session.noViolations')}</h3>
                    <p className="text-gray-600">
                      {t('session.noViolationsDesc')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default SessionDetailsPage;
