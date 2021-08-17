import type { AppProps } from 'next/app'
import Head from 'next/head'
import { TrackingProvider } from '../lib/contexts/ga'

import '../styles/globals.css'

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <TrackingProvider>
        <Component {...pageProps} />
      </TrackingProvider>
    </>
  )
}

export default App
