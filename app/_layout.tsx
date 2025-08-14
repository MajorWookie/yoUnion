import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider } from '@tamagui/core'
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query'
import { useColorScheme } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { useEffect } from 'react'
import config from '@/tamagui.config'
import { useAppStore } from '@/lib/stores/app-store'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { verifySecurity } from '@/lib/supabase'

// Configure network monitoring for offline support
onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected)
  })
})

// Enhanced QueryClient with better caching and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Smart retry logic
      retry: (failureCount, error: any) => {
        // Don't retry on 404s
        if (error?.status === 404) return false
        // Don't retry on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) return false
        // Retry up to 2 times for other errors
        return failureCount < 2
      },
      // Don't refetch on window focus for mobile
      refetchOnWindowFocus: false,
      // Always refetch on reconnect
      refetchOnReconnect: 'always',
      // Network mode
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Network mode for mutations
      networkMode: 'offlineFirst',
      // Global mutation error handler
      onError: (error: any) => {
        if (__DEV__) {
          console.error('Mutation error:', error)
        }
        // In production, you would report this to your error service
        // Sentry.captureException(error)
      },
    },
  },
})

function RootLayoutContent() {
  const systemTheme = useColorScheme()
  const { theme } = useAppStore()

  // Determine active theme
  const activeTheme = theme === 'system' ? (systemTheme || 'light') : theme

  // Verify security on mount (development only)
  useEffect(() => {
    if (__DEV__) {
      verifySecurity().catch(console.error)
    }
  }, [])

  // Set up performance monitoring (in production)
  useEffect(() => {
    if (!__DEV__) {
      // Initialize performance monitoring
      // Example with Sentry:
      // Sentry.init({
      //   dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      //   environment: 'production',
      //   tracesSampleRate: 0.1,
      // })
    }
  }, [])

  return (
    <TamaguiProvider config={config as any} defaultTheme={activeTheme}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{
          headerShown: false,
          animation: 'slide_from_right', // Smooth animations
          gestureEnabled: true,
        }}>
          <Stack.Screen
            name="(auth)"
            options={{
              presentation: 'modal',
              gestureEnabled: false, // Prevent swipe to dismiss on auth screens
            }}
          />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="company"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              presentation: 'modal',
              title: 'Not Found',
            }}
          />
        </Stack>
        <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      </QueryClientProvider>
    </TamaguiProvider>
  )
}

export default function RootLayout() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log app-level crashes
        if (!__DEV__) {
          // Send to crash reporting service
          // Sentry.captureException(error, {
          //   contexts: { react: errorInfo }
          // })
        }
      }}
    >
      <RootLayoutContent />
    </ErrorBoundary>
  )
}