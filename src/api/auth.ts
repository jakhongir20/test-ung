import { useAuthLoginCreate, useAuthSendOtpCreate, useAuthTokenRefreshCreate } from './generated/respondentWebAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export type Tokens = { access: string; refresh: string }

export const tokenStorage = {
  get access() { return localStorage.getItem('accessToken') || '' },
  get refresh() { return localStorage.getItem('refreshToken') || '' },
  setTokens(tokens?: Tokens) {
    if (!tokens) return
    localStorage.setItem('accessToken', tokens.access)
    localStorage.setItem('refreshToken', tokens.refresh)
  },
  clear() { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken') },
}

export function useSendOtp() {
  const m = useAuthSendOtpCreate()
  return useMutation({
    mutationFn: (phone: string) => m.mutateAsync({ data: { phone_number: phone } }),
  })
}

export function useLogin() {
  const m = useAuthLoginCreate()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { phone: string; code: string }) => m.mutateAsync({ data: { phone_number: args.phone, otp_code: args.code } as any }),
    onSuccess: (res: any) => {
      if (res?.access && res?.refresh) tokenStorage.setTokens({ access: res.access, refresh: res.refresh })
      qc.invalidateQueries()
    },
  })
}

export function useRefresh() {
  const m = useAuthTokenRefreshCreate()
  return useMutation({
    mutationFn: () => m.mutateAsync({ data: { refresh: tokenStorage.refresh } as any }),
    onSuccess: (res: any) => tokenStorage.setTokens({ access: res.access, refresh: res.refresh ?? tokenStorage.refresh }),
    onError: () => tokenStorage.clear(),
  })
}


