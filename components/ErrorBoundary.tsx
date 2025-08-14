import React from 'react'
import { YStack, Heading, Paragraph, Button, Card } from 'tamagui'
import { AlertTriangle, RefreshCw } from '@tamagui/lucide-icons'
import * as Application from 'expo-application'

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{
        error: Error
        errorInfo: React.ErrorInfo | null
        retry: () => void
    }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: null
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (__DEV__) {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }

        // Update state with error info
        this.setState({
            errorInfo
        })

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // In production, you would send this to your error reporting service
        // Example with Sentry:
        // Sentry.captureException(error, { 
        //   contexts: { 
        //     react: errorInfo,
        //     device: {
        //       appVersion: Application.nativeApplicationVersion,
        //       buildNumber: Application.nativeBuildVersion,
        //     }
        //   } 
        // })
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
    }

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                const Fallback = this.props.fallback
                return (
                    <Fallback
                        error={this.state.error}
                        errorInfo={this.state.errorInfo}
                        retry={this.handleReset}
                    />
                )
            }

            // Default error UI
            return <DefaultErrorFallback
                error={this.state.error}
                errorInfo={this.state.errorInfo}
                retry={this.handleReset}
            />
        }

        return this.props.children
    }
}

// Default error fallback component
function DefaultErrorFallback({
    error,
    errorInfo,
    retry
}: {
    error: Error
    errorInfo: React.ErrorInfo | null
    retry: () => void
}) {
    const isDev = __DEV__

    return (
        <YStack
            flex={1}
            backgroundColor="$background"
            padding="$4"
            justifyContent="center"
            alignItems="center"
        >
            <Card
                padding="$6"
                maxWidth={400}
                width="100%"
                backgroundColor="$red2"
                borderColor="$red6"
                borderWidth={1}
            >
                <YStack space="$4" alignItems="center">
                    <AlertTriangle size={48} color="$red10" />

                    <YStack space="$2" alignItems="center">
                        <Heading size="$6" color="$red11" textAlign="center">
                            Oops! Something went wrong
                        </Heading>

                        <Paragraph size="$4" color="$gray11" textAlign="center">
                            We encountered an unexpected error. Please try again.
                        </Paragraph>

                        {isDev && (
                            <YStack
                                space="$2"
                                padding="$3"
                                backgroundColor="$gray2"
                                borderRadius="$4"
                                marginTop="$4"
                                width="100%"
                            >
                                <Paragraph size="$2" fontFamily="$mono" color="$red10">
                                    {error.toString()}
                                </Paragraph>
                                {errorInfo && errorInfo.componentStack && (
                                    <Paragraph size="$1" fontFamily="$mono" color="$gray10">
                                        {errorInfo.componentStack.slice(0, 200)}...
                                    </Paragraph>
                                )}
                            </YStack>
                        )}
                    </YStack>

                    <Button
                        size="$4"
                        icon={RefreshCw}
                        onPress={retry}
                        backgroundColor="$blue9"
                        color="white"
                        pressStyle={{ backgroundColor: '$blue10' }}
                        marginTop="$4"
                    >
                        Try Again
                    </Button>
                </YStack>
            </Card>
        </YStack>
    )
}

// Screen-level error boundary with more specific error handling
export function ScreenErrorBoundary({
    children,
    screenName
}: {
    children: React.ReactNode
    screenName?: string
}) {
    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                // Log screen-specific errors
                if (__DEV__) {
                    console.error(`Error in screen ${screenName}:`, error)
                }
            }}
        >
            {children}
        </ErrorBoundary>
    )
}