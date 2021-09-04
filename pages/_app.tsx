import "tailwindcss/tailwind.css";
import { VFC, useEffect } from "react";
import type { AppProps } from "next/app";

import { AuthProvider } from "components/auth";

const MyApp: VFC<AppProps> = ({ Component, pageProps }) => {
  // Google Adsense Script Element
  useEffect(() => {
    const s = document.createElement("script");
    s.setAttribute(
      "src",
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    );
    s.setAttribute("async", "true");
    s.setAttribute("data-ad-client", "ca-pub-5392547007745588");
    document.head.appendChild(s);
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
};
export default MyApp;
