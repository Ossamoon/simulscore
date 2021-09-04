import React, { ReactElement } from "react";
import Document, {
  Html,
  Head,
  Main,
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
      <Html>
        <Head>
          <script
            data-ad-client="ca-pub-5392547007745588"
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          ></script>
        </Head>
        <body>
          <Main />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
