import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider } from '@tamagui/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import config from '@/tamagui.config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="company" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </TamaguiProvider>
  )
}