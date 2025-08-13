import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { YStack, XStack, Heading, Paragraph, Card, ListItem, ToggleGroup } from '@tamagui/core'
import { FileText, Calendar, ExternalLink } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { getCompanyOverview, getCompanyFilings } from '@/lib/api/companies'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Filing } from '@/lib/schemas'

const FILING_TYPES = ['10-K', '10-Q', '8-K', 'DEF 14A'] as const
type FilingType = typeof FILING_TYPES[number] | 'all'

export default function FilingsScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>()
  const [selectedType, setSelectedType] = useState<FilingType>('all')

  const { data: company } = useQuery({
    queryKey: ['company', ticker],
    queryFn: () => getCompanyOverview(ticker!),
    enabled: !!ticker,
  })

  const { data: filings, isLoading, error } = useQuery({
    queryKey: ['filings', company?.id, selectedType],
    queryFn: () => getCompanyFilings(
      company!.id,
      selectedType === 'all' ? undefined : [selectedType]
    ),
    enabled: !!company,
  })

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFilingDescription = (form: string): string => {
    switch (form) {
      case '10-K': return 'Annual Report'
      case '10-Q': return 'Quarterly Report'
      case '8-K': return 'Current Report'
      case 'DEF 14A': return 'Proxy Statement'
      default: return form
    }
  }

  const renderFilingItem = ({ item }: { item: Filing }) => (
    <Card margin="$2" padding="$0" pressStyle={{ scale: 0.98 }}>
      <ListItem
        hoverTheme
        pressTheme
        padding="$4"
        onPress={() => {
          // TODO: Navigate to filing detail screen
          // Opening filing
        }}
      >
        <ListItem.Text>
          <YStack space="$2">
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" space="$3">
                <YStack
                  width={40}
                  height={40}
                  backgroundColor="$blue2"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="$4"
                >
                  <FileText size={20} color="$blue10" />
                </YStack>
                <YStack>
                  <Heading size="$4">{item.form}</Heading>
                  <Paragraph size="$3" color="$gray11">
                    {getFilingDescription(item.form)}
                  </Paragraph>
                </YStack>
              </XStack>
              <ExternalLink size={16} color="$gray10" />
            </XStack>

            <XStack alignItems="center" space="$2" marginLeft="$11">
              <Calendar size={14} color="$gray10" />
              <Paragraph size="$2" color="$gray11">
                Filed {formatDate(item.filedAt)}
              </Paragraph>
              {item.periodEnd && (
                <>
                  <Paragraph size="$2" color="$gray11">•</Paragraph>
                  <Paragraph size="$2" color="$gray11">
                    Period ended {formatDate(item.periodEnd)}
                  </Paragraph>
                </>
              )}
            </XStack>
          </YStack>
        </ListItem.Text>
      </ListItem>
    </Card>
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorState
        description="Failed to load filings. Please try again."
      />
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4">
      <YStack space="$4">
        <YStack space="$2">
          <Heading size="$6">SEC Filings</Heading>
          {company && (
            <Paragraph size="$4" color="$gray11">
              {company.name} ({company.ticker})
            </Paragraph>
          )}
        </YStack>

        <ToggleGroup
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as FilingType)}
          type="single"
        >
          <ToggleGroup.Item value="all">
            <Paragraph size="$2">All</Paragraph>
          </ToggleGroup.Item>
          {FILING_TYPES.map(type => (
            <ToggleGroup.Item key={type} value={type}>
              <Paragraph size="$2">{type}</Paragraph>
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </YStack>

      <YStack flex={1} marginTop="$4">
        {!filings || filings.length === 0 ? (
          <EmptyState
            title="No filings found"
            description={`No ${selectedType === 'all' ? '' : selectedType + ' '}filings are available for this company.`}
            actionText="View All Types"
            onAction={() => setSelectedType('all')}
            icon={<FileText size={48} color="$gray10" />}
          />
        ) : (
          <>
            <Heading size="$5" marginBottom="$3">
              {filings.length} filing{filings.length !== 1 ? 's' : ''} found
            </Heading>
            <FlashList
              data={filings}
              renderItem={renderFilingItem}
              keyExtractor={(item) => item.id}
              estimatedItemSize={100}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </YStack>
    </YStack>
  )
}