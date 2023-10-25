import React, { useEffect, useState } from 'react'
// import '@/styles/globals.scss'
import '@/styles/index.css'
import '@/styles/bootstrap.min.css'
import { Layout } from '@/components'
// import 'tailwindcss/'  QUALQUER COISA VOLTAR
import type { AppProps } from 'next/app'
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
