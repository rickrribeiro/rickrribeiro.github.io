// node_modules
import type { AppProps } from 'next/app'

// styles
// import '@src-path/styles/globals.scss'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
