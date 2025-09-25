import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthUser = {
  id: number
  phone_number: string
  name: string
  position: number | string
  branch_name?: string
  position_name?: string
  gtf?: number
  gtf_name?: string
  work_domain?: string
  employee_level?: string
  is_moderator: boolean
  is_phone_verified: boolean
}

type AuthState = {
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
    }),
    { name: 'auth-user' }
  )
)


