import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import Link from 'next/link'
import SEO from 'src/components/seo'
import Date from '../../components/date'
import Layout from '../../components/layout'
import { getTag, getTags } from '../../lib/data/tags'
import { log } from '../../lib/functions/log'
import { asyncMap } from '../../utils/functions/async-map'
import { pick } from '../../utils/functions/pick'
import { replaceProperty } from '../../utils/functions/replace-property'

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const tag = await getTag(params!.slug![0])

  return {
    props: {
      tag: pick(tag, ['name']),
      posts: await asyncMap(tag.posts, async (post) => {
        const data = await post.data

        return replaceProperty(pick(data, ['title', 'href', 'created', 'excerpt']), 'created', (date) =>
          date.toISOString()
        )
      })
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await getTags()

  const paths = tags.all().map(({ slug }) => {
    return { params: { slug: [slug] } }
  })
  log('tags', JSON.stringify(paths))

  return {
    paths,
    fallback: false
  }
}

export const TagPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  tag,
  posts
}) => {
  return (
    <Layout>
      <SEO title={`Tag / ${tag.name}`} />
      <div>
        <h2>{tag.name}</h2>
        {posts.map(({ title, href, created, excerpt }) => {
          return [
            <div key={`${href}-meta`} className="col-start-2">
              <Date dateString={created} />
            </div>,
            <div key={`${href}-data`} className="col-start-3">
              <Link href={href}>
                <h3 style={{ marginTop: '0', cursor: 'pointer' }}>
                  <a>{title}</a>
                </h3>
              </Link>
              <p>{excerpt}</p>
            </div>
          ]
        })}
      </div>
    </Layout>
  )
}

export default TagPage
