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