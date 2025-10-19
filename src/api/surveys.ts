import { useSurveysStartCreate, useSessionsProgressRetrieve, useSessionsSubmitAnswerCreate, useCurrentSessionRetrieve, useSessionsRetrieve, useSessionsGetQuestionRetrieve, useSessionsFinishCreate } from './generated/respondentWebAPI'
import { useMutation, useQuery } from '@tanstack/react-query'
import { customInstance } from './mutator/custom-instance'

export function useStartSurvey() {
  const m = useSurveysStartCreate()
  return useMutation({
    mutationFn: (args: { id: number; count?: number }) => m.mutateAsync({ id: args.id, data: { questions_count: args.count ?? 30 } }),
  })
}

export function useSessionProgress(sessionId?: string) {
  return useSessionsProgressRetrieve(sessionId ?? '', {
    query: {
      enabled: !!sessionId,
      retry: 1,
      retryDelay: 1000
    }
  })
}

export function useSubmitAnswer() {
  const m = useSessionsSubmitAnswerCreate()
  return useMutation({
    mutationFn: (args: { sessionId: string; payload: any }) => m.mutateAsync({ id: args.sessionId, data: args.payload }),
  })
}

export function useCurrentSession() {
  return useCurrentSessionRetrieve()
}

export function useSessionDetails(sessionId?: string) {
  return useSessionsRetrieve(sessionId ?? '', { 
    query: { 
      enabled: !!sessionId,
      retry: 1,
      retryDelay: 1000
    } 
  })
}

export function useGetQuestion(sessionId?: string, order?: number) {
  return useSessionsGetQuestionRetrieve(
    sessionId ?? '', 
    { order: order ?? 1 }, 
    { 
      query: { 
        enabled: !!sessionId && !!order && order > 0,
        retry: 1, // Only retry once on failure
        retryDelay: 1000 // Wait 1 second before retry
      } 
    }
  )
}

export function useFinishSession() {
  const m = useSessionsFinishCreate()
  return useMutation({
    mutationFn: (sessionId: string) => m.mutateAsync({ id: sessionId, data: { expires_at: new Date().toISOString() } }),
  })
}

// Face monitoring violation tracking
export function useReportViolation() {
  return useMutation({
    mutationFn: async (data: {
      sessionId: string;
      violationType: 'no_face' | 'multiple_faces' | 'face_lost' | 'tab_switched';
      detectionData?: any;
      timestamp: string;
    }) => {
      const response = await customInstance({
        method: 'POST',
        url: `/api/sessions/${data.sessionId}/report_violation/`,
        data: {
          violation_type: data.violationType,
          detection_data: data.detectionData,
          timestamp: data.timestamp
        }
      });
      return response;
    }
  });
}

// Get current violation count from server
export function useGetViolationCount(sessionId?: string) {
  return useQuery({
    queryKey: ['sessionViolationCount', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await customInstance({
        method: 'GET',
        url: `/api/sessions/${sessionId}/violation_count/`
      });
      return response;
    },
    enabled: !!sessionId,
    refetchInterval: 5000, // Check every 5 seconds
    retry: 1
  });
}

// Custom sessions API implementation since orval didn't generate it
interface SessionSurvey {
  id: number;
  title: string;
  description: string;
  time_limit_minutes: number;
  questions_count: number;
  passing_score: number;
  max_attempts: number;
  total_questions: string;
}

interface Session {
  id: string;
  survey: SessionSurvey;
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

// Custom API function to fetch sessions using axios with proper configuration
async function fetchSessions(): Promise<Session[]> {
  return customInstance<Session[]>({
    method: 'GET',
    url: '/api/sessions/',
  });
}

export function useMyHistory() {
  return useQuery({
    queryKey: ['sessions-history'],
    queryFn: fetchSessions,
    enabled: true,
    retry: 1,
    retryDelay: 1000
  });
}


