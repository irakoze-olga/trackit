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
}
