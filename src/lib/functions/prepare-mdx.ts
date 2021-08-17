import deepmerge from 'deepmerge'
import { bundleMDX } from 'mdx-bundler'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'
import rehypeKatex from 'rehype-katex'
import rehypeMathJax from 'rehype-mathjax'
import { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkPrism from 'remark-prism'
import remarkRehype from 'remark-rehype'
import { Pluggable, unified } from 'unified'

export const prepareMdx = async (
  source: string,
  options: {
    files?: Record<string, string>
    directory?: string
    imagesUrl: string
  }
) => {
  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), 'node_modules', 'esbuild', 'esbuild.exe')
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), 'node_modules', 'esbuild', 'bin', 'esbuild')
  }

  const { directory, imagesUrl } = options

  const { code } = await bundleMDX(source, {
    cwd: directory,
    xdmOptions: (options) => {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        // remarkHighlight,
        // gfm,
        // remarkMdxImages
        remarkPrism as Pluggable<any>,
        remarkMath
      ]
      options.rehypePlugins = [...(options.rehypePlugins ?? []), rehypeKatex]

      return options
    },
    esbuildOptions: (options) => {
      options.outdir = path.join(process.cwd(), 'public', imagesUrl)
      options.loader = {
        ...options.loader,
        '.png': 'file',
        '.jpg': 'file',
        '.gif': 'file'
      }
      ;(options.publicPath = imagesUrl), (options.write = true)

      return options
    }
  })

  return code
}

export const prepareMdxRemote = async (source: string) => {
  const mdxSource = await serialize(source, {
    mdxOptions: {
      // @ts-ignore
      remarkPlugins: [remarkPrism, remarkMath],
      rehypePlugins: [rehypeMathJax]
    }
  })
  return mdxSource
}

export const prepareMarkdown = async (source: string): Promise<string> => {
  const schema = deepmerge(defaultSchema, { tagNames: ['math', 'mi'] })

  // Use remark to convert markdown into HTML string
  const processedContent = await unified()
    .use(remarkParse)
    // @ts-ignore
    .use(remarkPrism, {
      /* options */
    })
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeMathJax)
    //.use(rehypeSanitize)
    .use(rehypeStringify)
    .process(source)
  return processedContent.toString()
}
