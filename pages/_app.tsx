import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Script from 'next/script';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Script src="https://meet.jit.si/external_api.js" strategy="lazyOnload" />
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
