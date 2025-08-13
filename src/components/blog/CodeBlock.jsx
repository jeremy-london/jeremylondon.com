import { useState, useEffect } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneLight from "../../styles/prism-one-light";
import oneDark from "../../styles/prism-one-dark";

const CodeBlock = ({ language = "python", code }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark",
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "class" ||
            mutation.attributeName === "data-theme")
        ) {
          const isDark =
            document.documentElement.classList.contains("dark") ||
            document.documentElement.getAttribute("data-theme") === "dark";
          setIsDarkMode(isDark);
        }
      });
    });

    // Start observing the <html> element for attribute changes
    observer.observe(document.documentElement, {
      attributes: true, //configure it to listen to attribute changes
    });

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  // const [innerCode, setInnerCode] = useState(code)

  return (
    <SyntaxHighlighter
      language={language}
      style={isDarkMode ? oneDark : oneLight}>
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
