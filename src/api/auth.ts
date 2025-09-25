import {
  useAuthLoginCreate,
  useAuthPasswordLoginCreate,
  useAuthRegisterCreate,
  useAuthSendOtpCreate,
  useAuthTokenRefreshCreate
} from './generated/respondentWebAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { customInstance, refreshInstance } from './mutator/custom-instance'
import type { PatchedUserRequest } from './generated/models'

export type Tokens = { access: string; refresh: string }

export const tokenStorage = {
  get access() {
    return localStorage.getItem('accessToken') || ''
  },
  get refresh() {
    return localStorage.getItem('refreshToken') || ''
  },
  isAccessValid(): boolean {
    const t = this.access
    if (!t) return false
    try {
      const payload = JSON.parse(atob(t.split('.')[1] || ''))
      if (typeof payload?.exp !== 'number') return true
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  },
  setTokens(tokens?: Tokens) {
    if (!tokens) {
      console.log('❌ setTokens called with no tokens');
      return;
    }

    console.log('💾 setTokens called with:', {
      hasAccess: !!tokens.access,
      hasRefresh: !!tokens.refresh,
      accessLength: tokens.access?.length,
      refreshLength: tokens.refresh?.length
    });

    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);

    // Verify storage immediately
    const storedAccess = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    console.log('✅ Tokens stored successfully:', {
      storedAccessLength: storedAccess?.length,
      storedRefreshLength: storedRefresh?.length,
      accessMatches: storedAccess === tokens.access,
      refreshMatches: storedRefresh === tokens.refresh
    });
  },
  clear() {
    console.log('🗑️ Clearing tokens from localStorage');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
}

// Utility function to handle authentication errors
export const handleAuthError = (error: any) => {
  // Check if it's an authentication error
  if (error?.response?.status === 401 ||
    error?.response?.data?.non_field_errors?.includes('Invalid or inactive session') ||
    error?.response?.data?.detail === 'Token is invalid or expired') {

    // Clear tokens and user data
    tokenStorage.clear();
    useAuthStore.getState().setUser(null);

    // Remove any session data
    localStorage.removeItem('currentSurveySession');

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    return true; // Indicates this was an auth error
  }

  return false; // Not an auth error
};

export function useSendOtp() {
  const m = useAuthSendOtpCreate()
  return useMutation({
    mutationFn: (phone: string) => m.mutateAsync({data: {phone_number: phone}}),
  })
}

export function useLogin() {
  const m = useAuthLoginCreate()
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (args: { phone: string; code: string }) => m.mutateAsync({
      data: {
        phone_number: args.phone,
        otp_code: args.code
      }
    }),
    onSuccess: (data) => {
      const res = (data as any)?.tokens
      const user = (data as any)?.user
      if (res?.access && res?.refresh) tokenStorage.setTokens({access: res.access, refresh: res.refresh})
      if (user) setUser(user)
      qc.invalidateQueries()
    },
  })
}

export function useRefresh() {
  const m = useAuthTokenRefreshCreate()
  return useMutation({
    mutationFn: () => m.mutateAsync({data: {refresh: tokenStorage.refresh}}),
    onSuccess: (res) => {
      tokenStorage.setTokens({access: res.access, refresh: res.refresh ?? tokenStorage.refresh})
    },
    onError: () => tokenStorage.clear(),
  })
}

// Custom API function for updating user profile
export const updateUserProfile = async (data: PatchedUserRequest) => {
  return customInstance({
    method: 'POST',
    url: '/api/users/me/update/',
    data,
  });
};

// Hook for updating user profile
export function useUpdateUserProfile() {
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update user in store with new data
      if (data && typeof data === 'object' && 'id' in data) {
        setUser(data as any)
      }
      // Invalidate user queries to refresh data
      qc.invalidateQueries({queryKey: ['/api/users/me/']})
    },
  })
}

// Logout function
export const logout = () => {
  // Clear tokens and user data
  tokenStorage.clear();
  useAuthStore.getState().setUser(null);

  // Remove any session data
  localStorage.removeItem('currentSurveySession');

  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Password-based login hook
export function usePasswordLogin() {
  const m = useAuthPasswordLoginCreate()
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (args: { phone: string; password: string }) => m.mutateAsync({
      data: {
        phone_number: args.phone,
        password: args.password
      }
    }),
    onSuccess: async (data) => {
      const res = (data as any)

      if (res?.access && res?.refresh) {
        // Store tokens immediately
        localStorage.setItem('accessToken', res.access);
        localStorage.setItem('refreshToken', res.refresh);

        console.log('💾 Tokens stored directly:', {
          accessLength: res.access.length,
          refreshLength: res.refresh.length
        });

        // Verify storage immediately
        const storedAccess = localStorage.getItem('accessToken');
        const storedRefresh = localStorage.getItem('refreshToken');
        console.log('🔍 Direct storage verification:', {
          storedAccessLength: storedAccess?.length,
          storedRefreshLength: storedRefresh?.length,
          matchesAccess: storedAccess === res.access,
          matchesRefresh: storedRefresh === res.refresh
        });

        // Wait a bit more to ensure tokens are fully stored
        await new Promise(resolve => setTimeout(resolve, 200));

        // Double-check tokens are still there
        const finalCheck = localStorage.getItem('accessToken');
        console.log('🔍 Final token check:', {
          hasToken: !!finalCheck,
          tokenLength: finalCheck?.length
        });

        // Refresh the Axios instance to pick up new tokens
        refreshInstance();
      }

      // Set user data in the store
      // The user data might be directly in the response or nested under 'user'
      const userData = res?.user || res;
      if (userData && userData.id) {
        setUser(userData);
      }

      // Invalidate queries to trigger refetches
      qc.invalidateQueries()

      // Small delay to ensure tokens are properly stored
      await new Promise(resolve => setTimeout(resolve, 100))

      // Wait for critical queries to be set up
      try {
        console.log('🚀 Starting prefetch with token:', !!localStorage.getItem('accessToken'));

        // Temporarily disable prefetch to test token storage
        console.log('⏸️ Prefetch disabled for testing token storage');

        // Prefetch critical data that will be needed on the main page
        // await Promise.all([
        //   qc.prefetchQuery({
        //     queryKey: ['/api/users/me/'],
        //     queryFn: () => {
        //       console.log('📡 Prefetching /api/users/me/ with token:', !!localStorage.getItem('accessToken'));
        //       return customInstance({ method: 'GET', url: '/api/users/me/' });
        //     },
        //     staleTime: 5 * 60 * 1000, // 5 minutes
        //   }),
        //   qc.prefetchQuery({
        //     queryKey: ['/api/positions/'],
        //     queryFn: () => {
        //       console.log('📡 Prefetching /api/positions/ with token:', !!localStorage.getItem('accessToken'));
        //       return customInstance({ method: 'GET', url: '/api/positions/' });
        //     },
        //     staleTime: 10 * 60 * 1000, // 10 minutes
        //   }),
        //   qc.prefetchQuery({
        //     queryKey: ['/api/branches/'],
        //     queryFn: () => {
        //       console.log('📡 Prefetching /api/branches/ with token:', !!localStorage.getItem('accessToken'));
        //       return customInstance({ method: 'GET', url: '/api/branches/' });
        //     },
        //     staleTime: 10 * 60 * 1000, // 10 minutes
        //   })
        // ])
        console.log('✅ Prefetch skipped for testing');
      } catch (error) {
        console.warn('Failed to prefetch some data:', error)
        // Don't fail the login if prefetch fails
      }
    },
  })
}

// Register hook
export function useRegister() {
  const m = useAuthRegisterCreate()
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (args: {
      phone: string;
      password: string;
      name: string;
      position_id: number;
      gtf_id: number
    }) => m.mutateAsync({
      data: {
        phone_number: args.phone,
        password: args.password,
        name: args.name,
        position_id: args.position_id,
        gtf_id: args.gtf_id
      }
    }),
    onSuccess: async (data) => {
      const res = (data as any)

      if (res?.access && res?.refresh) {
        // Store tokens immediately
        localStorage.setItem('accessToken', res.access);
        localStorage.setItem('refreshToken', res.refresh);

        // Refresh the Axios instance to pick up new tokens
        refreshInstance();
      }

      // Set user data in the store
      // The user data might be directly in the response or nested under 'user'
      const userData = res?.user || res;
      if (userData && userData.id) {
        setUser(userData);
      }

      // Invalidate queries to trigger refetches
      qc.invalidateQueries()

      // Small delay to ensure tokens are properly stored
      await new Promise(resolve => setTimeout(resolve, 100))

      // Wait for critical queries to be set up
      try {
        console.log('🚀 Starting prefetch with token:', !!localStorage.getItem('accessToken'));

        // Temporarily disable prefetch to test token storage
        console.log('⏸️ Prefetch disabled for testing token storage');

        console.log('✅ Prefetch skipped for testing');
      } catch (error) {
        console.warn('Failed to prefetch some data:', error)
        // Don't fail the registration if prefetch fails
      }
    },
  })
}



