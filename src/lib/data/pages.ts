import fs from 'fs'
import path from 'path'
import { CONTENT_DIRECTORY } from 'src/config'
import { BaseProperties, file, getFiles } from './file'

export const PAGES_DIRECTORY = path.join(CONTENT_DIRECTORY, 'pages')

export interface PageProperties extends BaseProperties {
  /** The page slug, used for linking */
  slug: string
  href: string
}

interface PageFrontmatter {
  title: string
  content: string
  path: string
  permalink?: string
  excerpt: string
}

const pageProperties = (filePath: string): PageProperties => {
  const slug = path.basename(filePath).replace(/\.mdx?/, '')

  return {
    slug,
    href: `/${slug}`,
    bundleDirectory: `/img/pages/${slug}/`
  }
}

export const getPages = getFiles<PageFrontmatter, PageProperties>({
  directory: PAGES_DIRECTORY,
  getProperties: pageProperties,
  defaultQueryParameters: {
    limit: 5,
    orderBy: 'slug',
    order: 'ASC',
    skip: 0
  },
  getFilePath: (dir) => path.join(PAGES_DIRECTORY, dir)
})

export const getPage = (filePath: string) => {
  return file<PageFrontmatter, PageProperties>(filePath, pageProperties(filePath))
}

export const getPageBySlug = (slug: string) => {
  let filePath = path.join(PAGES_DIRECTORY, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PAGES_DIRECTORY, `${slug}.md`)
  }

  return getPage(filePath)
}
