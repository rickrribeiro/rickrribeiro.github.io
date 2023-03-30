import { Layout } from '@/components'
import '@/styles/globals.scss'
// import 'tailwindcss/'  QUALQUER COISA VOLTAR
import type { AppProps } from 'next/app'
import React, { useEffect, useState } from 'react'
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
