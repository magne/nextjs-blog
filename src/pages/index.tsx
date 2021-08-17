import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Date from '../components/date'
import Layout, { siteTitle } from '../components/layout'
import { getPosts } from '../lib/data/posts'
import utilStyles from '../styles/utils.module.css'
import { asyncMap } from '../utils/functions/async-map'
import { pick } from '../utils/functions/pick'
import { replaceProperty } from '../utils/functions/replace-property'

export const getStaticProps = async ({}: GetStaticPropsContext) => {
  const posts = await asyncMap(await getPosts(), async (post) => {
    return replaceProperty(pick(await post.data, ['slug', 'title', 'href', 'date', 'lead']), 'date', (date) =>
      date.toISOString()
    )
  })

  return {
    props: {
      posts
    }
  }
}

const IndexPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ posts }) => {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>[Your Self Introduction]</p>
        <p>
          (This is a sample website - you’ll be building a site like this on{' '}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
      </section>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {posts.map(({ title, href, date, lead }) => (
            <li className={utilStyles.listItem} key={href}>
              <Link href={href}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
              <p>{lead}</p>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}

export default IndexPage
