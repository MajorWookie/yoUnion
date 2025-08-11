import React, { useMemo } from 'react'
import { VictoryPie, VictoryContainer } from 'victory-native'
import { XStack, YStack, Heading, Paragraph, Card, ToggleGroup } from '@tamagui/core'
import { IncomeStatement } from '@/lib/schemas'

interface IncomeStatementPieProps {
  data: IncomeStatement
  view: 'simple' | 'detailed'
  onViewChange: (view: 'simple' | 'detailed') => void
}

const SIMPLE_VIEW_MAPPING = {
  'NET_SALES': { label: 'Revenue', color: '#3b82f6' },
  'GROSS_PROFIT': { label: 'Gross Profit', color: '#10b981' },
  'OPERATING_INCOME': { label: 'Operating Profit', color: '#f59e0b' },
  'PRETAX_INCOME': { label: 'Pre-Tax Profit', color: '#ef4444' },
  'NET_INCOME': { label: 'Net Profit', color: '#8b5cf6' },
}

const DETAILED_VIEW_MAPPING = {
  'NET_SALES': { label: 'Net Sales', color: '#3b82f6' },
  'COGS': { label: 'COGS', color: '#ef4444' },
  'GROSS_PROFIT': { label: 'Gross Profit', color: '#10b981' },
  'OPERATING_EXPENSES': { label: 'OPEX', color: '#f97316' },
  'EBIT': { label: 'EBIT', color: '#06b6d4' },
  'DEPRECIATION': { label: 'D&A', color: '#84cc16' },
  'EBITDA': { label: 'EBITDA', color: '#22c55e' },
  'INTEREST_EXPENSE': { label: 'Interest', color: '#f43f5e' },
  'PRETAX_INCOME': { label: 'EBT', color: '#a855f7' },
  'TAX_EXPENSE': { label: 'Tax', color: '#dc2626' },
  'NET_INCOME': { label: 'Net Income', color: '#8b5cf6' },
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`
  } else if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`
  } else if (Math.abs(value) >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

export function IncomeStatementPie({ data, view, onViewChange }: IncomeStatementPieProps) {
  const chartData = useMemo(() => {
    const mapping = view === 'simple' ? SIMPLE_VIEW_MAPPING : DETAILED_VIEW_MAPPING
    
    return data.lines
      .filter(line => mapping[line.lineCode as keyof typeof mapping])
      .map(line => ({
        x: mapping[line.lineCode as keyof typeof mapping]?.label || line.label,
        y: Math.abs(line.value),
        fill: mapping[line.lineCode as keyof typeof mapping]?.color || '#6b7280',
        rawValue: line.value,
      }))
      .filter(item => item.y > 0)
  }, [data, view])

  const totalRevenue = useMemo(() => {
    const revenueLine = data.lines.find(line => line.lineCode === 'NET_SALES')
    return revenueLine ? revenueLine.value : 0
  }, [data])

  return (
    <Card padding="$4" backgroundColor="$background">
      <YStack space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Heading size="$5">Income Statement</Heading>
            <Paragraph size="$3" color="$gray11">
              FY{data.fiscalYear} {data.isAnnual ? 'Annual' : `Q${data.fiscalQuarter}`}
            </Paragraph>
          </YStack>
          
          <ToggleGroup
            value={view}
            onValueChange={(value) => onViewChange(value as 'simple' | 'detailed')}
            type="single"
          >
            <ToggleGroup.Item value="simple">
              <Paragraph size="$2">Simple</Paragraph>
            </ToggleGroup.Item>
            <ToggleGroup.Item value="detailed">
              <Paragraph size="$2">Detailed</Paragraph>
            </ToggleGroup.Item>
          </ToggleGroup>
        </XStack>

        <XStack space="$4" alignItems="center">
          <YStack flex={1} maxWidth={200}>
            <VictoryContainer width={200} height={200}>
              <VictoryPie
                data={chartData}
                width={200}
                height={200}
                innerRadius={60}
                padAngle={2}
                colorScale={chartData.map(d => d.fill)}
                labelComponent={<></>}
              />
            </VictoryContainer>
          </YStack>
          
          <YStack flex={1} space="$2">
            <Heading size="$4">Total Revenue</Heading>
            <Heading size="$6" color="$blue10">{formatCurrency(totalRevenue)}</Heading>
            
            <YStack space="$1" marginTop="$3">
              {chartData.map((item, index) => (
                <XStack key={index} alignItems="center" space="$2">
                  <YStack
                    width={12}
                    height={12}
                    backgroundColor={item.fill}
                    borderRadius="$2"
                  />
                  <Paragraph size="$2" flex={1}>{item.x}</Paragraph>
                  <Paragraph size="$2" fontWeight="600">
                    {formatCurrency(item.rawValue)}
                  </Paragraph>
                </XStack>
              ))}
            </YStack>
          </YStack>
        </XStack>
      </YStack>
    </Card>
  )
}