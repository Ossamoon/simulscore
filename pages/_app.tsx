import "tailwindcss/tailwind.css";
import { VFC } from "react";
import type { AppProps } from "next/app";

import { AuthProvider } from "components/auth";

const MyApp: VFC<AppProps> = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
};
export default MyApp;
