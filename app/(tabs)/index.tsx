import React, { useState } from 'react'
import { router } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { YStack, XStack, Heading, Paragraph, Button, Input, Card, ListItem, Separator } from '@tamagui/core'
import { Search, Building, TrendingUp } from 'lucide-react-native'
import { useQuery } from '@tanstack/react-query'
import { searchCompanies } from '@/lib/api/companies'
import { useAppStore } from '@/lib/stores/app-store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'

interface Company {
  id: string
  ticker: string
  name: string
  logo_url: string | null
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const { recentSearches, addRecentSearch } = useAppStore()

  const { data: companies, isLoading, error, refetch } = useQuery({
    queryKey: ['companies', searchQuery],
    queryFn: () => searchCompanies(searchQuery),
    enabled: searchQuery.length > 0,
  })

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim())
      setHasSearched(true)
    }
  }

  const handleCompanySelect = (company: Company) => {
    router.push(`/company/${company.ticker}`)
  }

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <Card margin="$2" padding="$0" pressStyle={{ scale: 0.98 }}>
      <ListItem
        hoverTheme
        pressTheme
        onPress={() => handleCompanySelect(item)}
        padding="$4"
      >
        <ListItem.Text>
          <YStack space="$2">
            <XStack alignItems="center" space="$3">
              <YStack
                width={40}
                height={40}
                backgroundColor="$blue2"
                alignItems="center"
                justifyContent="center"
                borderRadius="$4"
              >
                {item.logo_url ? (
                  <Paragraph size="$2" fontWeight="600" color="$blue10">
                    {item.ticker.substring(0, 2)}
                  </Paragraph>
                ) : (
                  <Building size={20} color="$blue10" />
                )}
              </YStack>
              <YStack flex={1}>
                <Heading size="$4">{item.name}</Heading>
                <Paragraph size="$3" color="$gray11">{item.ticker}</Paragraph>
              </YStack>
              <TrendingUp size={16} color="$gray10" />
            </XStack>
          </YStack>
        </ListItem.Text>
      </ListItem>
    </Card>
  )

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack padding="$4" paddingTop="$8" space="$4">
        <YStack space="$2">
          <Heading size="$8" color="$blue10">Younion</Heading>
          <Paragraph size="$4" color="$gray11">
            Understand your company's financial story
          </Paragraph>
        </YStack>

        <YStack space="$3">
          <XStack space="$2">
            <Input
              flex={1}
              size="$4"
              placeholder="Search for a public company..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              leftIcon={<Search size={20} color="$gray10" />}
            />
            <Button size="$4" theme="blue" onPress={handleSearch}>
              Search
            </Button>
          </XStack>

          {recentSearches.length > 0 && !hasSearched && (
            <YStack space="$2">
              <Paragraph size="$3" color="$gray11">Recent searches:</Paragraph>
              <XStack space="$2" flexWrap="wrap">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    size="$3"
                    chromeless
                    color="$blue10"
                    onPress={() => {
                      setSearchQuery(search)
                      setHasSearched(true)
                    }}
                  >
                    {search}
                  </Button>
                ))}
              </XStack>
            </YStack>
          )}
        </YStack>
      </YStack>

      <YStack flex={1} padding="$4">
        {isLoading && <LoadingSpinner />}
        
        {error && (
          <ErrorState
            description="Failed to search companies. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && companies && companies.length === 0 && hasSearched && (
          <EmptyState
            title="No companies found"
            description="Try searching with a different company name or ticker symbol"
            actionText="Clear Search"
            onAction={() => {
              setSearchQuery('')
              setHasSearched(false)
            }}
          />
        )}

        {!isLoading && !error && !hasSearched && (
          <EmptyState
            title="Search for Companies"
            description="Enter a company name or ticker symbol to get started with financial insights"
            icon={<Search size={48} color="$blue10" />}
          />
        )}

        {companies && companies.length > 0 && (
          <YStack flex={1}>
            <Heading size="$5" marginBottom="$3">
              Search Results ({companies.length})
            </Heading>
            <FlashList
              data={companies}
              renderItem={renderCompanyItem}
              keyExtractor={(item) => item.id}
              estimatedItemSize={80}
              showsVerticalScrollIndicator={false}
            />
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}