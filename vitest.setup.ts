// Jest compatibility shim for Vitest
// Must be defined BEFORE importing any jest-dependent setup files
import { vi } from 'vitest'

// @ts-expect-error - provide a minimal Jest-compatible global for libraries expecting Jest
globalThis.jest = Object.assign(Object.create(null), vi, {
  fn: vi.fn,
  spyOn: vi.spyOn,
  mock: vi.mock,
  // Some jest setups use requireActual
  requireActual: (path: string) => require(path),
})

// Mock Tamagui config to a minimal object
jest.mock('@/tamagui.config', () => ({
  __esModule: true,
  default: {},
}))

// Dynamically import to ensure shim is in place before executing RNGH setup
await import('react-native-gesture-handler/jestSetup')

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

// Mock Tamagui core to simple React Native primitives
jest.mock('@tamagui/core', () => {
  const React = require('react')
  const { View, Text } = require('react-native')

  const passthrough = (Component: any) =>
    React.forwardRef((props: any, ref: any) =>
      React.createElement(Component, { ref, ...props }, props.children)
    )

  const TamaguiProvider = ({ children }: any) =>
    React.createElement(React.Fragment, null, children)

  const YStack = passthrough(View)
  const Heading = passthrough(Text)
  const Paragraph = passthrough(Text)

  const Button = ({ onPress, children, ...rest }: any) =>
    React.createElement(
      Text,
      { onPress, accessibilityRole: 'button', ...rest },
      children
    )

  return {
    TamaguiProvider,
    YStack,
    Heading,
    Paragraph,
    Button,
  }
})

// Mock icons used by components
jest.mock('@tamagui/lucide-icons', () => ({
  Search: () => null,
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