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