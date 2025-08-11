import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { describe, it, expect, vi } from 'vitest'
import { EmptyState } from '@/components/ui/EmptyState'
import { TamaguiProvider } from '@tamagui/core'
import config from '@/tamagui.config'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>
    {children}
  </TamaguiProvider>
)

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <TestWrapper>
        <EmptyState
          title="No data found"
          description="Try searching for something else"
        />
      </TestWrapper>
    )

    expect(screen.getByText('No data found')).toBeTruthy()
    expect(screen.getByText('Try searching for something else')).toBeTruthy()
  })

  it('renders action button when provided', () => {
    const mockAction = vi.fn()
    
    render(
      <TestWrapper>
        <EmptyState
          title="No data found"
          description="Try searching for something else"
          actionText="Search Again"
          onAction={mockAction}
        />
      </TestWrapper>
    )

    const actionButton = screen.getByText('Search Again')
    expect(actionButton).toBeTruthy()
    
    fireEvent.press(actionButton)
    expect(mockAction).toHaveBeenCalledTimes(1)
  })

  it('does not render action button when not provided', () => {
    render(
      <TestWrapper>
        <EmptyState
          title="No data found"
          description="Try searching for something else"
        />
      </TestWrapper>
    )

    expect(screen.queryByRole('button')).toBeNull()
  })
})