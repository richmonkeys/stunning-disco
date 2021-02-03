import { AppProps } from 'next/app'
import Head from 'next/head'
import { FC } from 'react'
import appMeta from '../configs/appMeta'
import '../styles/globals.css'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>{appMeta.name}</title>

        <link rel="preconnect" href="https://rsms.me" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App