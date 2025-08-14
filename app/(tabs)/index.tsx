import React, { useState, useCallback, useMemo } from 'react'
import { router } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { YStack, XStack, Heading, Paragraph, Button, Input, Card, ListItem, Separator } from '@tamagui/core'
import { Search, Building, TrendingUp } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { searchCompanies } from '@/lib/api/companies'
import { useAppStore } from '@/lib/stores/app-store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ScreenErrorBoundary } from '@/components/ErrorBoundary'
import { useDebounce } from '@/hooks/useDebounce'

interface Company {
  id: string
  ticker: string
  name: string
  logo_url: string | null
}

function HomeScreenContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const { recentSearches, addRecentSearch } = useAppStore()

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { data: companies, isLoading, error, refetch } = useQuery({
    queryKey: ['companies', debouncedSearchQuery],
    queryFn: () => searchCompanies(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0,
    // Keep previous data while fetching new results
    placeholderData: (previousData) => previousData,
  })

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim())
      setHasSearched(true)
    }
  }, [searchQuery, addRecentSearch])

  const handleCompanySelect = useCallback((company: Company) => {
    router.push(`/company/${company.ticker}`)
  }, [])

  // Memoized render function for better performance
  const renderCompanyItem = useCallback(({ item }: { item: Company }) => (
    <Card
      margin="$2"
      padding="$0"
      pressStyle={{ scale: 0.98 }}
      animation="quick"
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ticker ${item.ticker}`}
      accessibilityHint="Double tap to view company details"
    >
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
                  <Image
                    source={{ uri: item.logo_url }}
                    style={{ width: 30, height: 30 }}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <Building size={24} color="$blue10" />
                )}
              </YStack>
              <YStack flex={1}>
                <Heading size="$5" numberOfLines={1}>
                  {item.name}
                </Heading>
                <Paragraph size="$3" color="$gray10">
                  {item.ticker}
                </Paragraph>
              </YStack>
              <TrendingUp size={20} color="$gray10" />
            </XStack>
          </YStack>
        </ListItem.Text>
      </ListItem>
    </Card>
  ), [handleCompanySelect])

  // Key extractor for FlashList
  const keyExtractor = useCallback((item: Company) => item.id, [])

  // Item separator component
  const ItemSeparator = useMemo(() => () => <Separator marginVertical="$1" />, [])

  // Empty component
  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return <LoadingSpinner />
    if (error) {
      return (
        <ErrorState
          title="Search failed"
          description="Unable to search companies. Please try again."
          onRetry={refetch}
        />
      )
    }
    if (hasSearched && debouncedSearchQuery && !companies?.length) {
      return (
        <EmptyState
          title="No companies found"
          description={`No results for "${debouncedSearchQuery}". Try a different search term.`}
          icon={<Search size={48} color="$gray8" />}
        />
      )
    }
    return (
      <EmptyState
        title="Search for a company"
        description="Enter a company name or ticker symbol to get started"
        icon={<Search size={48} color="$gray8" />}
      />
    )
  }, [isLoading, error, hasSearched, debouncedSearchQuery, companies, refetch])

  // Recent searches component
  const RecentSearches = useMemo(() => {
    if (!recentSearches.length || searchQuery) return null

    return (
      <YStack space="$3" marginTop="$4">
        <Heading size="$4" color="$gray11">Recent Searches</Heading>
        <XStack flexWrap="wrap" gap="$2">
          {recentSearches.map((search, index) => (
            <Button
              key={`${search}-${index}`}
              size="$3"
              variant="outlined"
              onPress={() => setSearchQuery(search)}
              accessibilityLabel={`Recent search: ${search}`}
            >
              {search}
            </Button>
          ))}
        </XStack>
      </YStack>
    )
  }, [recentSearches, searchQuery])

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack padding="$4" paddingTop="$8" space="$4">
        <YStack space="$2">
          <Heading size="$8" color="$blue10">Younion</Heading>
          <Paragraph size="$4" color="$gray11">
            Financial transparency for employees
          </Paragraph>
        </YStack>

        <XStack space="$2" alignItems="center">
          <Input
            flex={1}
            size="$4"
            placeholder="Search companies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            accessibilityLabel="Company search input"
            accessibilityHint="Enter company name or ticker symbol"
          />
          <Button
            size="$4"
            icon={Search}
            onPress={handleSearch}
            disabled={!searchQuery.trim()}
            accessibilityLabel="Search button"
          >
            Search
          </Button>
        </XStack>

        {RecentSearches}
      </YStack>

      <YStack flex={1} padding="$2">
        {companies && companies.length > 0 ? (
          <FlashList
            data={companies}
            renderItem={renderCompanyItem}
            estimatedItemSize={80}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparator}
            contentContainerStyle={{ paddingBottom: 20 }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            drawDistance={200}
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
            testID="companies-list"
          />
        ) : (
          ListEmptyComponent
        )}
      </YStack>
    </YStack>
  )
}

export default function HomeScreen() {
  return (
    <ScreenErrorBoundary screenName="Home">
      <HomeScreenContent />
    </ScreenErrorBoundary>
  )
}

// Add missing import for Image
import { Image } from 'react-native'