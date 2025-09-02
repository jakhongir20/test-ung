import { useSurveysStartCreate, useSessionsProgressRetrieve, useSessionsSubmitAnswerCreate, useCurrentSessionRetrieve, useSessionsRetrieve, useSessionsGetQuestionRetrieve, useSessionsFinishCreate } from './generated/respondentWebAPI'
import { useMutation } from '@tanstack/react-query'

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
    mutationFn: (sessionId: string) => m.mutateAsync({ id: sessionId, data: {} }),
  })
}


