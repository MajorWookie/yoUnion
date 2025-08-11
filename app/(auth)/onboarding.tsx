import React, { useState } from 'react'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { YStack, XStack, Heading, Paragraph, Button, Input, Card, Progress } from '@tamagui/core'
import { BasicInfoSchema, BasicInfoInput, EmploymentInfoSchema, EmploymentInfoInput } from '@/lib/schemas'
import { updateProfile } from '@/lib/api/auth'
import { useAppStore } from '@/lib/stores/app-store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function OnboardingScreen() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [basicInfo, setBasicInfo] = useState<BasicInfoInput | null>(null)
  const setOnboarded = useAppStore(state => state.setOnboarded)

  const basicForm = useForm<BasicInfoInput>({
    resolver: zodResolver(BasicInfoSchema),
  })

  const employmentForm = useForm<EmploymentInfoInput>({
    resolver: zodResolver(EmploymentInfoSchema),
  })

  const onBasicInfoSubmit = (data: BasicInfoInput) => {
    setBasicInfo(data)
    setStep(2)
  }

  const onEmploymentInfoSubmit = async (data: EmploymentInfoInput) => {
    if (!basicInfo) return

    try {
      setIsLoading(true)
      setError(null)
      await updateProfile(basicInfo, data)
      setOnboarded(true)
      router.replace('/(tabs)/')
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your profile')
    } finally {
      setIsLoading(false)
    }
  }

  const onSkipEmployment = async () => {
    if (!basicInfo) return

    try {
      setIsLoading(true)
      setError(null)
      await updateProfile(basicInfo)
      setOnboarded(true)
      router.replace('/(tabs)/')
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your profile')
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
          <YStack space="$4" alignItems="center">
            <Heading size="$7">Welcome to Younion</Heading>
            <Paragraph size="$4" color="$gray11" textAlign="center">
              Let's set up your profile to get personalized financial insights
            </Paragraph>
            <Progress value={step === 1 ? 50 : 100} width="100%">
              <Progress.Indicator animation="lazy" backgroundColor="$blue10" />
            </Progress>
          </YStack>

          {error && (
            <Paragraph size="$3" color="$red10" textAlign="center">
              {error}
            </Paragraph>
          )}

          {step === 1 && (
            <YStack space="$4">
              <Heading size="$5">Basic Information</Heading>
              
              <YStack space="$2">
                <Paragraph size="$3" fontWeight="600">First Name *</Paragraph>
                <Controller
                  control={basicForm.control}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="$4"
                      placeholder="Enter your first name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      borderColor={basicForm.formState.errors.firstName ? '$red8' : undefined}
                    />
                  )}
                />
                {basicForm.formState.errors.firstName && (
                  <Paragraph size="$2" color="$red10">
                    {basicForm.formState.errors.firstName.message}
                  </Paragraph>
                )}
              </YStack>

              <YStack space="$2">
                <Paragraph size="$3" fontWeight="600">Last Name *</Paragraph>
                <Controller
                  control={basicForm.control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="$4"
                      placeholder="Enter your last name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      borderColor={basicForm.formState.errors.lastName ? '$red8' : undefined}
                    />
                  )}
                />
                {basicForm.formState.errors.lastName && (
                  <Paragraph size="$2" color="$red10">
                    {basicForm.formState.errors.lastName.message}
                  </Paragraph>
                )}
              </YStack>

              <YStack space="$2">
                <Paragraph size="$3" fontWeight="600">Phone Number (Optional)</Paragraph>
                <Controller
                  control={basicForm.control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="$4"
                      placeholder="Enter your phone number"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                    />
                  )}
                />
              </YStack>

              <Button size="$4" theme="blue" onPress={basicForm.handleSubmit(onBasicInfoSubmit)}>
                Continue
              </Button>
            </YStack>
          )}

          {step === 2 && (
            <YStack space="$4">
              <YStack space="$2">
                <Heading size="$5">Employment Information</Heading>
                <Paragraph size="$3" color="$gray11">
                  This helps us provide relevant financial insights (all optional)
                </Paragraph>
              </YStack>

              <YStack space="$2">
                <Paragraph size="$3" fontWeight="600">Current Employer</Paragraph>
                <Controller
                  control={employmentForm.control}
                  name="currentEmployer"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="$4"
                      placeholder="Enter your current employer"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </YStack>

              <YStack space="$2">
                <Paragraph size="$3" fontWeight="600">Job Title</Paragraph>
                <Controller
                  control={employmentForm.control}
                  name="unofficialTitle"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="$4"
                      placeholder="Enter your job title"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </YStack>

              <XStack space="$4">
                <Button flex={1} size="$4" onPress={onSkipEmployment}>
                  Skip for Now
                </Button>
                <Button 
                  flex={1} 
                  size="$4" 
                  theme="blue" 
                  onPress={employmentForm.handleSubmit(onEmploymentInfoSubmit)}
                >
                  Complete
                </Button>
              </XStack>
            </YStack>
          )}
        </YStack>
      </Card>
    </YStack>
  )
}