import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'
import utilStyles from '../styles/utils.module.css'

const name = 'Your Name'

export const Header: FC<JSX.IntrinsicElements['header'] & { readonly home?: boolean }> = ({
  home,
  ...props
}) => (
  <header {...props}>
    {home ? (
      <>
        <Image
          priority
          src="/images/profile.jpg"
          className={utilStyles.borderCircle}
          height={144}
          width={144}
          alt={name}
        />
        <h1 className={utilStyles.heading2Xl}>{name}</h1>
      </>
    ) : (
      <>
        <Link href="/">
          <a>
            <Image
              priority
              src="/images/profile.jpg"
              className={utilStyles.borderCircle}
              height={108}
              width={108}
              alt={name}
            />
          </a>
        </Link>
        <h2 className={utilStyles.headingLg}>
          <Link href="/">
            <a className={utilStyles.colorInherit}>{name}</a>
          </Link>
        </h2>
      </>
    )}
  </header>
)
