import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'
import Date from './date'

interface ICardProps {
  title: string
  href: string
  content: string
  featuredImage?: string
  meta?: {
    time?: string
    tag?: string
  }
}

export const Card: FC<ICardProps> = ({ title, href, content, featuredImage, meta }) => {
  const image = featuredImage ? `/assets/posts${href}/${featuredImage.replace('./', '')}` : null
  console.log(featuredImage)

  return (
    <article>
      <Link href={href}>
        <a>
          {image && <Image src={image} alt={''} width={190} height={190} objectFit="cover" />}
          <div>
            <header>
              {meta && (
                <div>
                  {meta.tag && <>{meta.tag}</>}
                  {meta.time && <Date dateString={meta.time} />}
                </div>
              )}
              {title && <div>{title}</div>}
            </header>
            {content && <p dangerouslySetInnerHTML={{ __html: content }} />}
          </div>
        </a>
      </Link>
    </article>
  )
}
