import { Inter } from 'next/font/google'
import { Providers } from "./providers";
import { UserProvider } from './AppContext';
import './globals.css'
import { Navbar, NavbarItem } from '@nextui-org/react';
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Inventory Manager',
  description: 'Sample client for Fall 23 COMS4156 Project by Team iheartapi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <UserProvider>
            <Navbar>
              <NavbarItem>
                <Link href="/">Home</Link>
              </NavbarItem>
              <NavbarItem>
                <Link href="/search">Search</Link>
              </NavbarItem>
            </Navbar>
            {children}
          </UserProvider>
        </Providers>
      </body>
    </html>
  )
}
