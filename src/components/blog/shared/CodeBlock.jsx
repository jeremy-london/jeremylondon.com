import oneDark from '@styles/prism-one-dark'
import oneLight from '@styles/prism-one-light'
import { useEffect, useState } from 'react'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'

const CodeBlock = ({ language = 'python', code }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark',
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark'
      setIsDarkMode(isDark)
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  return (
    <SyntaxHighlighter
      key={isDarkMode ? 'dark' : 'light'} // remounts on theme change only
      language={language}
      style={isDarkMode ? oneDark : oneLight}
    >
      {code}
    </SyntaxHighlighter>
  )
}

export default CodeBlock
