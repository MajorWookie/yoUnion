import React from 'react'
import { router } from 'expo-router'
import { YStack, XStack, Heading, Paragraph, Button, Card, Separator, Switch } from 'tamagui'
import { User, Settings, LogOut, Moon, Sun, Smartphone } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { signOut, getProfile } from '@/lib/api/auth'
import { useAppStore } from '@/lib/stores/app-store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ProfileScreen() {
  const { theme, setTheme } = useAppStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/(auth)/login')
    } catch (error) {
      // Handle sign out error silently
      // In production, you might want to show a toast or alert
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={20} color="$gray10" />
      case 'dark': return <Moon size={20} color="$gray10" />
      default: return <Smartphone size={20} color="$gray10" />
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" paddingTop="$8">
      <YStack space="$6">
        <YStack space="$2">
          <Heading size="$7">Profile</Heading>
          <Paragraph size="$4" color="$gray11">
            Manage your account and preferences
          </Paragraph>
        </YStack>

        {profile && (
          <Card padding="$4">
            <XStack alignItems="center" space="$4">
              <YStack
                width={60}
                height={60}
                backgroundColor="$blue2"
                alignItems="center"
                justifyContent="center"
                borderRadius="$8"
              >
                <User size={30} color="$blue10" />
              </YStack>
              <YStack flex={1}>
                <Heading size="$5">
                  {profile.first_name} {profile.last_name}
                </Heading>
                <Paragraph size="$3" color="$gray11">
                  {profile.email}
                </Paragraph>
                {profile.current_employer && (
                  <Paragraph size="$3" color="$gray11">
                    {profile.unofficial_title} at {profile.current_employer}
                  </Paragraph>
                )}
              </YStack>
            </XStack>
          </Card>
        )}

        <Card padding="$4">
          <YStack space="$4">
            <Heading size="$5">Preferences</Heading>

            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" space="$3">
                {getThemeIcon()}
                <YStack>
                  <Paragraph size="$4" fontWeight="600">Theme</Paragraph>
                  <Paragraph size="$3" color="$gray11">
                    {theme === 'system' ? 'Follow system' : `${theme} mode`}
                  </Paragraph>
                </YStack>
              </XStack>
              <Button
                size="$3"
                chromeless
                onPress={() => {
                  const themes = ['light', 'dark', 'system'] as const
                  const currentIndex = themes.indexOf(theme)
                  const nextTheme = themes[(currentIndex + 1) % themes.length]
                  setTheme(nextTheme)
                }}
              >
                Change
              </Button>
            </XStack>

            <Separator />

            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" space="$3">
                <Settings size={20} color="$gray10" />
                <YStack>
                  <Paragraph size="$4" fontWeight="600">Settings</Paragraph>
                  <Paragraph size="$3" color="$gray11">
                    App preferences and notifications
                  </Paragraph>
                </YStack>
              </XStack>
              <Button size="$3" chromeless>
                Configure
              </Button>
            </XStack>
          </YStack>
        </Card>

        <Card padding="$4">
          <YStack space="$4">
            <Heading size="$5">Account</Heading>

            <Button
              size="$4"
              chromeless
              color="$red10"
              justifyContent="flex-start"
              icon={<LogOut size={20} color="$red10" />}
              onPress={handleSignOut}
            >
              Sign Out
            </Button>
          </YStack>
        </Card>

        <YStack alignItems="center" marginTop="$4">
          <Paragraph size="$2" color="$gray11">
            yoUnion v1.0.0
          </Paragraph>
        </YStack>
      </YStack>
    </YStack>
  )
}