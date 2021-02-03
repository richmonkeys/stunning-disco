import { MDXProvider } from '@mdx-js/react'
import Head from 'next/head'
import { FC } from 'react'
import appMeta from '../../configs/appMeta'
import CodeBlock from '../CodeBlock'

interface Props {
  meta?: {
    title?: string
    description?: string
  }
  asd: {
    [dsa: string]: string
  }
}

const DefaultLayout: FC<Props> = ({ meta, children }) => {
  return (
    <MDXProvider
      components={{
        code: CodeBlock,
        inlineCode: props => <code {...props} className="bg-gray-200 px-2 py-1 rounded" />,
      }}
    >
      <>
        <Head>
          <title>{appMeta.name} - {meta?.title ?? appMeta.description}</title>
          <meta name="description" content={meta?.description ?? appMeta.description} />
        </Head>
        <div className="px-4 py-6 lg:py-12">
          <div className="mx-auto prose-indigo prose lg:prose-lg xl:prose-xl 2xl:prose-2xl">
            <h1>{meta?.title ?? appMeta.name}</h1>
            <p>{meta?.description ?? appMeta.description}</p>
            <hr />
            {children}
            <hr />
            <p>GitHub: <a href="https://github.com/richmonkeys">@richmonkeys</a></p>
          </div>
        </div>
      </>
    </MDXProvider>
  )
}

export default DefaultLayout