import React, { useState } from 'react'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { YStack, XStack, Heading, Paragraph, Button, Input, Card } from 'tamagui'
import { SignUpSchema, SignUpInput } from '@/lib/schemas'
import { signUp } from '@/lib/api/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function SignUpScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { control, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  })

  const onSubmit = async (data: SignUpInput) => {
    try {
      setIsLoading(true)
      setError(null)
      await signUp(data)
      router.replace('/(auth)/onboarding')
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up')
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
            <Heading size="$8" color="$blue10">Younion</Heading>
            <Paragraph size="$4" color="$gray11" textAlign="center">
              Create your account to get started
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
                    placeholder="Create a password"
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

            <YStack space="$2">
              <Paragraph size="$3" fontWeight="600">Confirm Password</Paragraph>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    size="$4"
                    placeholder="Confirm your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    borderColor={errors.confirmPassword ? '$red8' : undefined}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Paragraph size="$2" color="$red10">
                  {errors.confirmPassword.message}
                </Paragraph>
              )}
            </YStack>
          </YStack>

          <YStack space="$4">
            <Button size="$4" theme="blue" onPress={handleSubmit(onSubmit)}>
              Create Account
            </Button>

            <XStack justifyContent="center" space="$2">
              <Paragraph size="$3" color="$gray11">Already have an account?</Paragraph>
              <Button
                size="$3"
                chromeless
                color="$blue10"
                onPress={() => router.push('/(auth)/login')}
              >
                Sign In
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  )
}