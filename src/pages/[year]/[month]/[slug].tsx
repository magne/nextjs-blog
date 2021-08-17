import { getMDXComponent } from 'mdx-bundler/client'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import Head from 'next/head'
import { useMemo } from 'react'
import Date from '../../../components/date'
import Layout from '../../../components/layout'
import { getPostFromSlug, getPosts } from '../../../lib/data/posts'
import { log } from '../../../lib/functions/log'
import utilStyles from '../../../styles/utils.module.css'
import { pick } from '../../../utils/functions/pick'
import { replaceProperty } from '../../../utils/functions/replace-property'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts({ limit: false, orderBy: 'href' })

  const paths = posts.map(({ properties }) => {
    return {
      params: {
        year: properties.year,
        month: properties.month,
        slug: properties.slug
      }
    }
  })

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = async ({
  params
}: GetStaticPropsContext<{ year: string; month: string; slug: string }>) => {
  if (params && params.year && params.month && params.slug) {
    const post = getPostFromSlug(params.year, params.month, params.slug)

    log('post', `rendering post /${params.year}/${params.month}/${params.slug}`)

    const { variant, bundle: source } = await post.bundle

    return {
      props: {
        post: replaceProperty(
          pick(await post.data, ['slug', 'title', 'lead', 'href', 'tags', 'year', 'month', 'date']),
          'date',
          (date) => date.toISOString()
        ),
        variant,
        source
      }
    }
  }

  throw 'Should never get here'
}

const PostPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ post, variant, source }) => {
  const Component = useMemo(() => (variant === 'bundler' ? getMDXComponent(source as string) : null), [variant, source])
  return (
    <Layout>
      <Head>
        <title>{post.title}</title>
        <link rel="stylesheet" href="https://unpkg.com/prismjs/themes/prism-okaidia.css"></link>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.min.css"
          integrity="sha384-RZU/ijkSsFbcmivfdRBQDtwuwVqK7GMOw6IMvKyeWL2K5UAlyp6WonmB8m7Jd0Hn"
          crossOrigin="anonymous"
        />
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{post.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={post.date} />
        </div>
        {variant == 'unified' ? (
          <>
            <h3>Using unified toolchain</h3>
            <div dangerouslySetInnerHTML={{ __html: source as string }} />
          </>
        ) : variant == 'bundler' ? (
          <>
            <h3>Using mdx-bundler</h3>
            {Component ? <Component /> : <h3 color="tomato">Component not set</h3>}
          </>
        ) : variant == 'remote' ? (
          <>
            <h3>Using next-mdx-remote</h3>
            <div className="wrapper">
              <MDXRemote {...(source as MDXRemoteSerializeResult)} />
            </div>
          </>
        ) : (
          <h3 color="red">Unknown variant: {{variant}}</h3>
        )}
      </article>
    </Layout>
  )
}

export default PostPage
