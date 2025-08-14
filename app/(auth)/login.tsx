import React, { useState } from 'react'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { YStack, XStack, Heading, Paragraph, Button, Input, Card } from 'tamagui'
import { SignInSchema, SignInInput } from '@/lib/schemas'
import { signIn } from '@/lib/api/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { control, handleSubmit, formState: { errors } } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
  })

  const onSubmit = async (data: SignInInput) => {
    try {
      setIsLoading(true)
      setError(null)
      await signIn(data)
      router.replace('/(tabs)/')
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" justifyContent="center">
      <Card padding="$6" maxWidth={400} alignSelf="center" width="100%">
        <YStack space="$6">
          <YStack space="$2" alignItems="center">
            <Heading size="$8" color="$blue10">yoUnion</Heading>
            <Paragraph size="$4" color="$gray11" textAlign="center">
              Sign in to access your financial data
            </Paragraph>
          </YStack>

          {error && (
            <Paragraph size="$3" color="$red10" textAlign="center">
              {error}
            </Paragraph>
          )}

          <YStack space="$4">
            <YStack space="$2">
              <Paragraph size="$3" fontWeight="600">Email</Paragraph>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    size="$4"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    borderColor={errors.email ? '$red8' : undefined}
                  />
                )}
              />
              {errors.email && (
                <Paragraph size="$2" color="$red10">
                  {errors.email.message}
                </Paragraph>
              )}
            </YStack>

            <YStack space="$2">
              <Paragraph size="$3" fontWeight="600">Password</Paragraph>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    size="$4"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    borderColor={errors.password ? '$red8' : undefined}
                  />
                )}
              />
              {errors.password && (
                <Paragraph size="$2" color="$red10">
                  {errors.password.message}
                </Paragraph>
              )}
            </YStack>
          </YStack>

          <YStack space="$4">
            <Button size="$4" theme="blue" onPress={handleSubmit(onSubmit)}>
              Sign In
            </Button>

            <XStack justifyContent="center" space="$2">
              <Paragraph size="$3" color="$gray11">Don't have an account?</Paragraph>
              <Button
                size="$3"
                chromeless
                color="$blue10"
                onPress={() => router.push('/(auth)/signup')}
              >
                Sign Up
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  )
}