import React, { ReactElement } from "react";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render(): ReactElement {
    return (
      <Html lang="ja">
        <Head>
          <meta name="theme-color" content="#047857" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="SimulScore" />
          <meta
            property="og:image"
            content="https://www.simulscore.app/ogp.png"
          />
          <meta property="og:locale" content="ja_JP" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@simulscore" />
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            type="image/png"
            sizes="180x180"
            href="/apple-touch-icon-180x180.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/icon-192x192.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
