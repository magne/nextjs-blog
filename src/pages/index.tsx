import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { Card } from 'src/components/card'
import SEO from 'src/components/seo'
import Layout from '../components/layout'
import { getPosts } from '../lib/data/posts'
import utilStyles from '../styles/utils.module.css'
import { asyncMap } from '../utils/functions/async-map'
import { pick } from '../utils/functions/pick'
import { replaceProperty } from '../utils/functions/replace-property'

export const getStaticProps = async ({}: GetStaticPropsContext) => {
  const posts = await asyncMap(await getPosts(), async (post) => {
    return replaceProperty(
      pick(await post.data, [
        'slug',
        'title',
        'href',
        'created',
        'excerpt',
        'featuredImage',
        'tags'
      ]),
      'created',
      (date) => date.toISOString()
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
      <SEO />
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
          {posts.map(({ ...post }, index) => (
            <Card
              key={index}
              title={post.title}
              href={post.href}
              content={post.excerpt}
              featuredImage={post.featuredImage}
              meta={{
                time: post.created,
                tag: post.tags ? (post.tags.length > 0 ? post.tags[0] : undefined) : undefined
              }}
            />
          ))}
        </ul>
      </section>
    </Layout>
  )
}

export default IndexPage
