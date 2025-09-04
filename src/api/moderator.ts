import { useModeratorUsersList, useModeratorUsersRetrieve } from './generated/respondentWebAPI';
import { useQuery } from '@tanstack/react-query';

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
