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