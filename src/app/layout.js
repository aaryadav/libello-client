import { Inter } from 'next/font/google'
import './globals.css'

import { Hotkeys } from './components/Hotkeys.jsx'
import FiefW from './components/FiefW.js';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Libello',
  description: 'Your ML intern',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FiefW>
          <Hotkeys />
          {children}
        </FiefW>
      </body>
    </html>
  )
}
