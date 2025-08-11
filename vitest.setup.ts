import 'react-native-gesture-handler/jestSetup'

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    })),
  },
}))

// Mock Zustand stores
jest.mock('@/lib/stores/app-store', () => ({
  useAppStore: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
    recentSearches: [],
    addRecentSearch: jest.fn(),
    isOnboarded: false,
    setOnboarded: jest.fn(),
    lastViewedCompany: null,
    setLastViewedCompany: jest.fn(),
  })),
}))