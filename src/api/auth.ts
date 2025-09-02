import { useAuthLoginCreate, useAuthSendOtpCreate, useAuthTokenRefreshCreate } from './generated/respondentWebAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'

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
    if (!tokens) return
    localStorage.setItem('accessToken', tokens.access)
    localStorage.setItem('refreshToken', tokens.refresh)
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken')
  },
}

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


