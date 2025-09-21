import { useModeratorUsersList, useModeratorUsersRetrieve } from './generated/respondentWebAPI';
import { useQuery } from '@tanstack/react-query';
import { customInstance } from './mutator/custom-instance';

export function useModeratorUsers(params?: {
  branch?: string;
  position?: string;
  search?: string;
  status?: string;
}) {
  return useModeratorUsersList(params, {
    query: {
      enabled: true,
      retry: 1,
      retryDelay: 1000
    }
  });
}

export function useModeratorUserDetails(userId?: number) {
  return useModeratorUsersRetrieve(userId ?? 0, {
    query: {
      enabled: !!userId,
      retry: 1,
      retryDelay: 1000
    }
  });
}

// New API function for session details
export const moderatorUserSessionRetrieve = async (sessionId: string) => {
  return customInstance({
    method: 'GET',
    url: `/api/moderator/users/session/${sessionId}/`,
  });
};

export function useModeratorUserSessionDetails(sessionId?: string) {
  return useQuery({
    queryKey: ['/api/moderator/users/session/', sessionId],
    queryFn: () => moderatorUserSessionRetrieve(sessionId!),
    enabled: !!sessionId,
    retry: 1,
    retryDelay: 1000
  });
}
