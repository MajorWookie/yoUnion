import { useEffect, useState } from 'react'

/**
 * Debounce a value by a specified delay
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

// hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'

export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null)
    const [networkType, setNetworkType] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected)
            setNetworkType(state.type)
        })

        // Get initial state
        NetInfo.fetch().then((state) => {
            setIsConnected(state.isConnected)
            setNetworkType(state.type)
        })

        return unsubscribe
    }, [])

    return { isConnected, networkType }
}

// hooks/useAppState.ts
import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'

export function useAppState(
    onChange?: (status: AppStateStatus) => void
): AppStateStatus {
    const appState = useRef(AppState.currentState)

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App has come to the foreground
                onChange?.('active')
            } else if (
                appState.current === 'active' &&
                nextAppState.match(/inactive|background/)
            ) {
                // App has gone to the background
                onChange?.(nextAppState)
            }
            appState.current = nextAppState
        })

        return () => {
            subscription.remove()
        }
    }, [onChange])

    return appState.current
}

// hooks/useKeyboard.ts
import { useEffect, useState } from 'react'
import { Keyboard, KeyboardEvent, Platform } from 'react-native'

interface KeyboardInfo {
    isVisible: boolean
    height: number
}

export function useKeyboard(): KeyboardInfo {
    const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
        isVisible: false,
        height: 0,
    })

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

        const showSubscription = Keyboard.addListener(
            showEvent,
            (e: KeyboardEvent) => {
                setKeyboardInfo({
                    isVisible: true,
                    height: e.endCoordinates.height,
                })
            }
        )

        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardInfo({
                isVisible: false,
                height: 0,
            })
        })

        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [])

    return keyboardInfo
}

// hooks/usePersistentState.ts
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function usePersistentState<T>(
    key: string,
    initialValue: T
): [T, (value: T) => void, boolean] {
    const [state, setState] = useState<T>(initialValue)
    const [isLoading, setIsLoading] = useState(true)

    // Load persisted state
    useEffect(() => {
        AsyncStorage.getItem(key)
            .then((value) => {
                if (value !== null) {
                    try {
                        setState(JSON.parse(value))
                    } catch (error) {
                        console.error(`Error parsing persisted state for key ${key}:`, error)
                    }
                }
            })
            .catch((error) => {
                console.error(`Error loading persisted state for key ${key}:`, error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [key])

    // Persist state changes
    const setPersistentState = (value: T) => {
        setState(value)
        AsyncStorage.setItem(key, JSON.stringify(value)).catch((error) => {
            console.error(`Error persisting state for key ${key}:`, error)
        })
    }

    return [state, setPersistentState, isLoading]
}