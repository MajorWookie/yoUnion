import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface ThemeState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

interface SearchState {
  recentSearches: string[]
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
}

interface AppState extends ThemeState, SearchState {
  isOnboarded: boolean
  setOnboarded: (value: boolean) => void
  lastViewedCompany: string | null
  setLastViewedCompany: (ticker: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      
      // Search
      recentSearches: [],
      addRecentSearch: (query) => {
        const current = get().recentSearches
        const updated = [query, ...current.filter(q => q !== query)].slice(0, 5)
        set({ recentSearches: updated })
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      // App state
      isOnboarded: false,
      setOnboarded: (value) => set({ isOnboarded: value }),
      lastViewedCompany: null,
      setLastViewedCompany: (ticker) => set({ lastViewedCompany: ticker }),
    }),
    {
      name: 'yoUnion-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)