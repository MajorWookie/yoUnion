import { YStack, Heading, Paragraph, Button } from '@tamagui/core'
import { Search } from '@tamagui/lucide-icons'

interface EmptyStateProps {
  title: string
  description: string
  actionText?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon = <Search size={48} color="$gray10" />
}: EmptyStateProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space="$4">
      {icon}
      <YStack alignItems="center" space="$2">
        <Heading size="$6" textAlign="center">{title}</Heading>
        <Paragraph size="$4" color="$gray11" textAlign="center" maxWidth={280}>
          {description}
        </Paragraph>
      </YStack>
      {actionText && onAction && (
        <Button size="$4" theme="blue" onPress={onAction}>
          {actionText}
        </Button>
      )}
    </YStack>
  )
}