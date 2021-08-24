import { constants, existsSync, statSync } from 'fs'
import { access, stat } from 'fs/promises'
import path from 'path'
import { CONTENT_DIRECTORY } from 'src/config'
import { BaseProperties, file, getFiles } from './file'

const POSTS_DIRECTORY = path.join(CONTENT_DIRECTORY, 'posts')

export interface PostProperties extends BaseProperties {
  /** The post's slug, used for linking */
  slug: string
  year: string
  month: string
  href: string
}

export interface PostFrontmatter {
  title: string
  content: string
  path: string
  tags: string[]
  featuredImage?: string
  excerpt: string
  created: Date
  updated: Date
}

const postProperties = (filePath: string): PostProperties => {
  let directory = filePath
  if (filePath.match(/index\.mdx?$/)) {
    directory = path.dirname(filePath)
  }
  const dir = path.basename(directory).replace(/\.mdx?$/, '')

  const [year, month, ...slug] = dir.split('-')

  const href = '/' + [year, month, slug.join('-')].join('/')

  return {
    year,
    month,
    slug: slug.join('-'),
    href,
    bundleDirectory: `/img/posts${href}`
  }
}

const postPredicate = async (directory: string, name: string): Promise<boolean> => {
  if (name.match(/^\d{4}-\d{2}-.+/)) {
    let fileStat = await stat(path.join(directory, name))
    if (fileStat.isFile() && name.match(/\.mdx?$/)) {
      return true
    }
    if (fileStat.isDirectory()) {
      try {
        await access(path.join(directory, name, 'index.mdx'), constants.R_OK)
        return true
      } catch {
        await access(path.join(directory, name, 'index.md'), constants.R_OK)
        return true
      }
    }
  }
  return false
}

const postGetFilePath = (name: string): string => {
  const fileStat = statSync(path.join(POSTS_DIRECTORY, name))
  if (fileStat.isFile() && name.match(/\.mdx?$/)) {
    return path.join(POSTS_DIRECTORY, name)
  }
  if (existsSync(path.join(POSTS_DIRECTORY, name, 'index.mdx'))) {
    return path.join(POSTS_DIRECTORY, name, 'index.mdx')
  }
  return path.join(POSTS_DIRECTORY, name, 'index.md')
}

export const getPosts = getFiles<PostFrontmatter, PostProperties>({
  directory: POSTS_DIRECTORY,
  getProperties: postProperties,
  defaultQueryParameters: {
    limit: 50,
    skip: 0,
    orderBy: 'created',
    order: 'DESC'
  },
  predicate: postPredicate,
  getFilePath: postGetFilePath
})

export const getPost = (filePath: string) => {
  return file<PostFrontmatter, PostProperties>(filePath, postProperties(filePath))
}

export const getPostFromSlug = (year: string, month: string, slug: string) => {
  const rootPath = path.join(POSTS_DIRECTORY, [year, month, slug].join('-'))
  const filePaths = [
    path.join(rootPath, 'index.mdx'),
    path.join(rootPath, 'index.md'),
    [rootPath, 'mdx'].join('.'),
    [rootPath, 'md'].join('.')
  ]
  const filePath = filePaths.find((path) => existsSync(path))
  if (filePath) {
    return getPost(filePath)
  }
  throw 'Post not found'
}
