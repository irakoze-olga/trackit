<<<<<<< HEAD
'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: any) {
  // Filter out the "script tag" warning in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (args[0]?.includes?.('Encountered a script tag')) return;
      originalError(...args);
    };
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
=======
'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeController />
      {children}
    </NextThemesProvider>
  )
}

function getAutomaticTheme() {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const lightStart = 6 * 60 + 30
  const darkStart = 18 * 60 + 30

  return minutes >= darkStart || minutes < lightStart ? 'dark' : 'light'
}

function ThemeController() {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const applyTheme = () => {
      const stored = window.localStorage.getItem('trackit-theme-preference')
      const preference = stored || 'auto'
      if (!stored) {
        window.localStorage.setItem('trackit-theme-preference', 'auto')
      }
      if (preference === 'auto') {
        setTheme(getAutomaticTheme())
      }
    }

    applyTheme()
    const interval = window.setInterval(applyTheme, 60 * 1000)
    return () => window.clearInterval(interval)
  }, [setTheme])

  return null
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
}
