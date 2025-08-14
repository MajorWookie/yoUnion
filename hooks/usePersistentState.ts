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