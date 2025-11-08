/**
 * Council Store
 * Zustand state management for council sessions
 * Phase 3: Council state and messages
 */

import { create } from 'zustand'
import { Council, CouncilWithMessages, Message } from '@ai-council/shared-types'

interface CouncilState {
  // Councils
  councils: Council[]
  currentCouncil: CouncilWithMessages | null
  isLoadingCouncils: boolean

  // Messages
  messages: Message[]
  isLoadingMessages: boolean

  // Actions
  setCouncils: (councils: Council[]) => void
  setCurrentCouncil: (council: CouncilWithMessages | null) => void
  addMessage: (message: Message) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
}

export const useCouncilStore = create<CouncilState>((set) => ({
  // State
  councils: [],
  currentCouncil: null,
  isLoadingCouncils: false,
  messages: [],
  isLoadingMessages: false,

  // Actions
  setCouncils: (councils) => set({ councils }),

  setCurrentCouncil: (council) =>
    set({
      currentCouncil: council,
      messages: council?.messages || [],
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (loading) => set({ isLoadingCouncils: loading }),
}))
