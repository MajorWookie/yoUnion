import { YStack, Heading, Paragraph, Button } from '@tamagui/core'
import { TriangleAlert as AlertTriangle } from '@tamagui/lucide-icons'

interface ErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry
}: ErrorStateProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space="$4">
      <AlertTriangle size={48} color="$red10" />
      <YStack alignItems="center" space="$2">
        <Heading size="$6" textAlign="center">{title}</Heading>
        <Paragraph size="$4" color="$gray11" textAlign="center" maxWidth={280}>
          {description}
        </Paragraph>
      </YStack>
      {onRetry && (
        <Button size="$4" theme="blue" onPress={onRetry}>
          Try Again
        </Button>
      )}
    </YStack>
  )
}