import Highlight, { defaultProps, Language } from 'prism-react-renderer'
import { FC } from 'react'
// import theme from 'prism-react-renderer/themes/nightOwl'
import theme from '../configs/prism-themes/vsc-dark-plus'

interface Props {
  children?: string
  className?: string
  live?: boolean
  render?: boolean
}

const CodeBlock: FC<Props> = ({ children, className = '' }) => {
  const language = className.replace(/language-/, '')

  return (
    <Highlight {...defaultProps} code={children?.trim?.()} language={language as Language} theme={theme}>
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ padding: 0, margin: 0 }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

export default CodeBlock