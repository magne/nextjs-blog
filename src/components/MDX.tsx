import { getMDXComponent } from 'mdx-bundler/client'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { FC, useMemo } from 'react'
import { Variant } from '../lib/data/file'

export const MDX: FC<{ variant: Variant; source: string | MDXRemoteSerializeResult }> = ({ variant, source }) => {
  const Component = useMemo(() => (variant === 'bundler' ? getMDXComponent(source as string) : null), [variant, source])

  return variant == 'unified' ? (
    <>
      <h3>Using unified tool chain</h3>
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
    <h3 color="red">Unknown variant: {{ variant }}</h3>
  )
}

export const Content: FC<{ heading: string; variant: Variant; source: string | MDXRemoteSerializeResult }> = ({
  heading,
  variant,
  source
}) => {
  return (
    <ContentContainer>
      <h1>{heading}</h1>
      <MDX variant={variant} source={source} />
    </ContentContainer>
  )
}

export const ContentContainer: FC = ({ children }) => {
  return <div>{children}</div>
}
