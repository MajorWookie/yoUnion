import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

// Offline queue for mutations
interface QueuedMutation {
    id: string
    mutationFn: () => Promise<any>
    timestamp: number
    retryCount: number
}

class OfflineManager {
    private queue: QueuedMutation[] = []
    private isOnline: boolean = true
    private maxRetries: number = 3
    private queryClient: QueryClient | null = null

    constructor() {
        this.initializeNetworkListener()
        this.loadQueue()
    }

    private async initializeNetworkListener() {
        // Set initial state
        const state = await NetInfo.fetch()
        this.isOnline = !!state.isConnected

        // Listen for changes
        NetInfo.addEventListener((state) => {
            const wasOffline = !this.isOnline
            this.isOnline = !!state.isConnected

            if (wasOffline && this.isOnline) {
                // Coming back online - process queue
                this.processQueue()
            }
        })
    }

    private async loadQueue() {
        try {
            const stored = await AsyncStorage.getItem('offline_queue')
            if (stored) {
                this.queue = JSON.parse(stored)
            }
        } catch (error) {
            console.error('Failed to load offline queue:', error)
        }
    }

    private async saveQueue() {
        try {
            await AsyncStorage.setItem('offline_queue', JSON.stringify(this.queue))
        } catch (error) {
            console.error('Failed to save offline queue:', error)
        }
    }

    public async addToQueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) {
        const queuedMutation: QueuedMutation = {
            ...mutation,
            id: `${Date.now()}_${Math.random()}`,
            timestamp: Date.now(),
            retryCount: 0,
        }

        this.queue.push(queuedMutation)
        await this.saveQueue()

        // Try to process immediately if online
        if (this.isOnline) {
            this.processQueue()
        }
    }

    private async processQueue() {
        if (!this.isOnline || this.queue.length === 0) return

        const toProcess = [...this.queue]

        for (const mutation of toProcess) {
            try {
                await mutation.mutationFn()
                // Remove successful mutation from queue
                this.queue = this.queue.filter(m => m.id !== mutation.id)
            } catch (error) {
                console.error('Failed to process queued mutation:', error)

                // Increment retry count
                const index = this.queue.findIndex(m => m.id === mutation.id)
                if (index !== -1) {
                    this.queue[index].retryCount++

                    // Remove if max retries exceeded
                    if (this.queue[index].retryCount > this.maxRetries) {
                        this.queue = this.queue.filter(m => m.id !== mutation.id)
                        console.error('Mutation exceeded max retries, removing from queue')
                    }
                }
            }
        }

        await this.saveQueue()

        // Invalidate relevant queries after processing
        if (this.queryClient) {
            this.queryClient.invalidateQueries()
        }
    }

    public setQueryClient(client: QueryClient) {
        this.queryClient = client
    }

    public getQueueSize(): number {
        return this.queue.length
    }

    public getOnlineStatus(): boolean {
        return this.isOnline
    }

    public async clearQueue() {
        this.queue = []
        await this.saveQueue()
    }
}

// Create singleton instance
export const offlineManager = new OfflineManager()

// Setup function to initialize offline support with QueryClient
export function setupOfflineSupport(queryClient: QueryClient) {
    // Set the query client for offline manager
    offlineManager.setQueryClient(queryClient)

    // Create persister
    const asyncStoragePersister = createAsyncStoragePersister({
        storage: AsyncStorage,
        throttleTime: 1000,
        serialize: (data) => JSON.stringify(data),
        deserialize: (data) => JSON.parse(data),
    })

    // Persist query client
    persistQueryClient({
        queryClient,
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buster: '', // Change this to invalidate the cache
        hydrateOptions: {
            // Options for hydrating the client from storage
        },
        dehydrateOptions: {
            // Options for dehydrating the client to storage
            shouldDehydrateQuery: (query) => {
                // Only persist successful queries
                return query.state.status === 'success'
            },
        },
    })

    return offlineManager
}

// Hook to use offline manager in components
import { useEffect, useState } from 'react'

export function useOfflineManager() {
    const [queueSize, setQueueSize] = useState(offlineManager.getQueueSize())
    const [isOnline, setIsOnline] = useState(offlineManager.getOnlineStatus())

    useEffect(() => {
        const interval = setInterval(() => {
            setQueueSize(offlineManager.getQueueSize())
            setIsOnline(offlineManager.getOnlineStatus())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return {
        queueSize,
        isOnline,
        addToQueue: offlineManager.addToQueue.bind(offlineManager),
        clearQueue: offlineManager.clearQueue.bind(offlineManager),
    }
}

// Offline-aware mutation wrapper
export function createOfflineMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: {
        onSuccess?: (data: TData) => void
        onError?: (error: Error) => void
    }
) {
    return async (variables: TVariables) => {
        const isOnline = offlineManager.getOnlineStatus()

        if (!isOnline) {
            // Queue the mutation for later
            await offlineManager.addToQueue({
                mutationFn: () => mutationFn(variables),
            })

            // Return a pending promise
            return new Promise<TData>((resolve) => {
                // Will be resolved when the queue is processed
            })
        }

        try {
            const result = await mutationFn(variables)
            options?.onSuccess?.(result)
            return result
        } catch (error) {
            options?.onError?.(error as Error)
            throw error
        }
    }
}