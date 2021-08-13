import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Head from "next/head";
import Date from "../../components/date";
import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import utilStyles from "../../styles/utils.module.css";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

export default function Post({
  postData,
}: {
  postData: {
    title: string;
    date: string;
    variant?: string;
    content: string | MDXRemoteSerializeResult;
  };
}) {
  const Component = useMemo(
    () =>
      postData.variant === "bundler"
        ? getMDXComponent(postData.content as unknown as string)
        : null,
    [postData.variant, postData.content]
  );
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/prismjs/themes/prism-okaidia.css"
        ></link>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.min.css" integrity="sha384-RZU/ijkSsFbcmivfdRBQDtwuwVqK7GMOw6IMvKyeWL2K5UAlyp6WonmB8m7Jd0Hn" crossOrigin="anonymous" />

      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        {typeof postData.content === "string" ? (
          Component ? (
            <Component />
          ) : (
            <div dangerouslySetInnerHTML={{__html: postData.content as unknown as string}} />
          )
        ) : (
          <div className="wrapper">
            <MDXRemote
              {...(postData.content as unknown as MDXRemoteSerializeResult)}
            ></MDXRemote>
          </div>
        )}
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params) {
    return { props: {} };
  }
  const postData = await getPostData(params.id as string);
  return {
    props: {
      postData,
    },
  };
};
