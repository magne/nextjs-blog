import Link from 'next/link'
import React from 'react'
import { Footer } from './footer'
import { Header } from './header'
import styles from './layout.module.css'

export default function Layout({ children, home }: { children: React.ReactNode; home?: boolean }) {
  return (
    <>
      <Header className={styles.header} home={home} />
      <main>
        <div className={styles.container}>
          {children}
          {!home && (
            <div className={styles.backToHome}>
              <Link href="/">
                <a>← Back to home</a>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
