import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { YStack, XStack, Heading, Paragraph, Button, Card, ScrollView, ToggleGroup } from '@tamagui/core'
import { Building, FileText, DollarSign, Users } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { getCompanyOverview, getIncomeStatement } from '@/lib/api/companies'
import { useAppStore } from '@/lib/stores/app-store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { IncomeStatementPie } from '@/components/charts/IncomeStatementPie'

export default function CompanyOverviewScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>()
  const [chartView, setChartView] = useState<'simple' | 'detailed'>('simple')
  const [period, setPeriod] = useState<'annual' | 'quarterly'>('annual')
  const { setLastViewedCompany } = useAppStore()

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery({
    queryKey: ['company', ticker],
    queryFn: () => getCompanyOverview(ticker!),
    enabled: !!ticker,
    onSuccess: () => setLastViewedCompany(ticker!),
  })

  const { data: incomeStatement, isLoading: incomeLoading } = useQuery({
    queryKey: ['incomeStatement', company?.id, period],
    queryFn: () => getIncomeStatement(company!.id, undefined, period === 'annual'),
    enabled: !!company,
  })

  const formatCurrency = (value: number): string => {
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`
    }
    return `$${value.toLocaleString()}`
  }

  const formatRatio = (ratio: number): string => {
    return `${ratio.toFixed(0)}:1`
  }

  if (companyLoading) {
    return <LoadingSpinner />
  }

  if (companyError || !company) {
    return (
      <ErrorState
        title="Company not found"
        description="We couldn't find information for this company. Please try searching for another company."
        onRetry={() => router.back()}
      />
    )
  }

  return (
    <ScrollView flex={1} backgroundColor="$background" showsVerticalScrollIndicator={false}>
      <YStack padding="$4" space="$6">
        {/* Company Header */}
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
              {company.logoUrl ? (
                <Paragraph size="$4" fontWeight="600" color="$blue10">
                  {company.ticker.substring(0, 2)}
                </Paragraph>
              ) : (
                <Building size={30} color="$blue10" />
              )}
            </YStack>
            <YStack flex={1}>
              <Heading size="$6">{company.name}</Heading>
              <Paragraph size="$4" color="$gray11">{company.ticker}</Paragraph>
              {company.ceoName && (
                <Paragraph size="$3" color="$gray11">
                  CEO: {company.ceoName}
                </Paragraph>
              )}
            </YStack>
          </XStack>
        </Card>

        {/* Pay Ratio Card */}
        {company.payRatio && (
          <Card padding="$4">
            <YStack space="$3">
              <XStack alignItems="center" space="$3">
                <DollarSign size={24} color="$orange10" />
                <Heading size="$5">CEO Pay Ratio ({company.payRatio.year})</Heading>
              </XStack>

              <YStack space="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Paragraph size="$4" color="$gray11">CEO Total Compensation</Paragraph>
                  <Heading size="$5" color="$green10">
                    {formatCurrency(company.payRatio.ceoTotalComp)}
                  </Heading>
                </XStack>

                <XStack justifyContent="space-between" alignItems="center">
                  <Paragraph size="$4" color="$gray11">Median Employee Pay</Paragraph>
                  <Heading size="$5">
                    {formatCurrency(company.payRatio.medianEmployeePay)}
                  </Heading>
                </XStack>

                <XStack justifyContent="space-between" alignItems="center" paddingTop="$2">
                  <Paragraph size="$4" fontWeight="600">Pay Ratio</Paragraph>
                  <Heading size="$6" color="$orange10">
                    {formatRatio(company.payRatio.ratio)}
                  </Heading>
                </XStack>
              </YStack>
            </YStack>
          </Card>
        )}

        {/* Period Toggle */}
        <XStack justifyContent="center">
          <ToggleGroup
            value={period}
            onValueChange={(value) => setPeriod(value as 'annual' | 'quarterly')}
            type="single"
          >
            <ToggleGroup.Item value="annual">
              <Paragraph size="$3">Annual</Paragraph>
            </ToggleGroup.Item>
            <ToggleGroup.Item value="quarterly">
              <Paragraph size="$3">Quarterly</Paragraph>
            </ToggleGroup.Item>
          </ToggleGroup>
        </XStack>

        {/* Income Statement Chart */}
        {incomeLoading && (
          <Card padding="$6">
            <LoadingSpinner size="small" />
          </Card>
        )}

        {!incomeLoading && incomeStatement && (
          <IncomeStatementPie
            data={incomeStatement}
            view={chartView}
            onViewChange={setChartView}
          />
        )}

        {!incomeLoading && !incomeStatement && (
          <Card padding="$4">
            <YStack alignItems="center" space="$3">
              <FileText size={32} color="$gray10" />
              <Paragraph size="$4" color="$gray11" textAlign="center">
                No {period} financial data available
              </Paragraph>
            </YStack>
          </Card>
        )}

        {/* Actions */}
        <XStack space="$3">
          <Button
            flex={1}
            size="$4"
            icon={<FileText size={20} />}
            onPress={() => router.push(`/company/${ticker}/filings`)}
          >
            View Filings
          </Button>
          <Button
            flex={1}
            size="$4"
            variant="outlined"
            icon={<Users size={20} />}
          >
            Compare
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}