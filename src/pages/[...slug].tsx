import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import SEO from 'src/components/seo'
import Layout from '../components/layout'
import { Content } from '../components/MDX'
import { getPageBySlug, getPages } from '../lib/data/pages'
import { pick } from '../utils/functions/pick'

export const getStaticProps = async ({ params }: GetStaticPropsContext<{ slug: string[] }>) => {
  const page = getPageBySlug(params!.slug[0])

  const { variant, bundle: source } = await page.bundle

  return {
    props: {
      page: pick(await page.data, ['title', 'slug']),
      variant,
      source
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await getPages({ limit: false })

  const paths = pages.map(({ properties }) => {
    return { params: { slug: [properties.slug] } }
  })

  return { paths, fallback: false }
}

const Page: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  page,
  variant,
  source
}) => {
  return (
    <Layout>
      <SEO title={page.title} />
      <Content heading={page.title} variant={variant} source={source} />
    </Layout>
  )
}

export default Page
