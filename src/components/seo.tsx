import Head from 'next/head'
import { FC } from 'react'
import { metadata } from 'src/config'

export const siteTitle = 'Next.js Sample Website'

interface ISEOProps {
  title?: string
  description?: string
}

const SEO: FC<ISEOProps> = ({ title, description }) => {
  const siteTitle = title ? `${title} - ${metadata.title}` : metadata.title
  const metaDescription = description
    ? description
    : metadata.description.replace('%TOPICS%', metadata.topics.join(', '))

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="icon" href="/favicon.ico" />
      <meta
        property="og:image"
        content={`https://og-image.vercel.app/${encodeURI(
          siteTitle
        )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
      />
      <meta name="og:title" content={siteTitle} />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  )
}

export default SEO
