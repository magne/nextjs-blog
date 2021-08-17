import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import GA4 from 'react-ga4'

const MeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!
const TrackingContext = React.createContext<{ logEvent: (event: any) => void }>({ logEvent: () => {} })

type EventArgs = {
  action: string
  category: string
  label?: string
  value?: number
  nonInteraction?: boolean
  transport?: 'beacon' | 'xhr' | 'image'
}

const TrackingProvider: React.FC = (props) => {
  const [analytics, setAnalytics] = useState({ isInitialized: false })

  const logEvent = ({ action, category, label, value, nonInteraction, transport, ...args }: EventArgs) => {
    if (analytics.isInitialized) {
      // send event
      GA4.event({ action, category, label, value, nonInteraction, transport, ...args })
    }
  }

  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (analytics.isInitialized) {
        // handle pageview
        GA4.set({ page: url })
        GA4.pageview(url)
      }
    }

    const { isInitialized } = analytics

    if (!isInitialized) {
      GA4.initialize(MeasurementId)

      GA4.pageview(window.location.pathname)

      router.events.on('routeChangeComplete', handleRouteChange)

      setAnalytics((prev) => ({
        ...prev,
        isInitialized: true
      }))
    }

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [analytics, router])

  return <TrackingContext.Provider value={{ logEvent }} {...props} />
}

const useTracking = () => React.useContext(TrackingContext)

export { TrackingProvider, useTracking }
