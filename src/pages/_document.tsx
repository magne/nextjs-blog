import NextDocument, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import React from 'react'
import { setInitialTheme } from 'src/components/ThemeToggle'

class Document extends NextDocument<{}> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await NextDocument.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en" dir="ltr">
        <Head />
        <body>
          {/* TODO: Move to ThemeToggle when all pages have a theme toggle */}
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default Document
