/**
 * Runtime Provider Component
 *
 * Initializes and provides runtime adapter to the entire app.
 * Must wrap your app or feature that uses runtime hooks.
 */

import React, { createContext, useEffect, useState, ReactNode } from "react"
import type { RuntimeAdapter } from "../adapters/base"
import { initRuntime } from "../runtime"

// Runtime Context
export const RuntimeContext = createContext<RuntimeAdapter | null>(null)

interface RuntimeProviderProps {
  children: ReactNode
}

/**
 * Runtime Provider Component
 * Initializes and provides runtime adapter to the app
 *
 * Usage:
 * ```tsx
 * <RuntimeProvider>
 *   <App />
 * </RuntimeProvider>
 * ```
 */
export const RuntimeProvider: React.FC<RuntimeProviderProps> = ({
  children,
}) => {
  const [adapter, setAdapter] = useState<RuntimeAdapter | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        const runtimeAdapter = await initRuntime()
        if (mounted) {
          setAdapter(runtimeAdapter)
        }
      } catch (error) {
        console.error("Failed to initialize runtime:", error)
      } finally {
        if (mounted) {
          setIsInitializing(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  if (isInitializing || !adapter) {
    return null // or loading spinner
  }

  return (
    <RuntimeContext.Provider value={adapter}>
      {children}
    </RuntimeContext.Provider>
  )
}
