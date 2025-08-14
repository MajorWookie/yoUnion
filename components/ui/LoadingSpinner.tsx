import { Spinner, YStack } from 'tamagui'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
}

export function LoadingSpinner({ size = 'large', color = '$blue10' }: LoadingSpinnerProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Spinner size={size} color={color} />
    </YStack>
  )
}