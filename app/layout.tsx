import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title:       'SQL:DUNGEON — Query or Perish',
  description: 'Learn T-SQL by descending through narrative dungeon quests. CSCI 331 · Queens College CUNY.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1728',
              color:      '#e8d5a3',
              border:     '1px solid rgba(139,92,246,0.3)',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize:   '0.75rem',
            },
          }}
        />
      </body>
    </html>
  )
}
