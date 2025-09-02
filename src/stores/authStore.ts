import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthUser = {
  id: number
  phone_number: string
  name: string
  branch: string
  position: string
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


