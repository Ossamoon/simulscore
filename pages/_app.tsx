import "tailwindcss/tailwind.css";
import { VFC } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";

import { AuthProvider } from "components/auth";

const MyApp: VFC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
};
export default MyApp;
