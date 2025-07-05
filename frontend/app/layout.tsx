import '../src/app/globals.css'
import { Saira, Audiowide } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { GlobalSettingsProvider } from '@/components/providers/ThemeProvider'
import { OracleProvider } from '@/components/providers/OracleProvider'
import OracleBlob from '@/components/oracle/oracle-blob'
import { Toaster } from '@/components/ui/toaster'

const saira = Saira({ subsets: ['latin'] })
const audiowide = Audiowide({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide'
})

export const metadata = {
  title: 'Best SAAS Kit Pro',
  description: 'The ultimate starter kit for your SAAS project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${saira.className} ${audiowide.variable} min-h-screen antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <GlobalSettingsProvider>
            <OracleProvider>
              <div className="min-h-screen flex flex-col">
                {children}
              </div>
              
              {/* Oracle Blob - Available on all pages when enabled */}
              <OracleBlob />
            </OracleProvider>
          </GlobalSettingsProvider>
          {/* Global toast notifications */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
