import './globals.css'
import { Saira, Audiowide } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { GlobalSettingsProvider } from '@/components/providers/ThemeProvider'

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
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </GlobalSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
