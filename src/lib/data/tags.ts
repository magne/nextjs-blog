import { readFile } from 'fs/promises'
import yaml from 'js-yaml'
import path from 'path'
import { DB, db, WithIndex } from 'sodb'
import { CONTENT_DIRECTORY } from 'src/config'
import { asyncForEach } from '../../utils/functions/async-for-each'
import { parameterize } from '../../utils/functions/parameterize'
import { log } from '../functions/log'
import { tagHref } from '../functions/tag-href'
import { File } from './file'
import { getPosts, PostFrontmatter, PostProperties } from './posts'

const DEFAULT_TAG_COLOR = '#888'
interface Tag {
  name: string
  slug: string
  href: string
  icon: string | null
  color: string
  featured: boolean
  posts: File<PostFrontmatter, PostProperties>[]
}

const getTagsFromFile = async (tags: DB<Tag>) => {
  const filename = path.join(CONTENT_DIRECTORY, 'tags.yml')
  try {
    const content = await readFile(filename, 'utf-8')
    const doc = yaml.load(content) as {
      name: string
      slug: string
      icon: string
      color: string
      featured: boolean
    }[]

    doc.forEach((tag) => {
      const { name, slug, color = DEFAULT_TAG_COLOR, icon = null, featured = false } = tag
      const t = tags.lookup(name)
      if (t) {
        const tag: WithIndex<Tag> = {
          ...t,
          slug: slug ?? parameterize(name),
          href: tagHref(slug ?? name),
          icon,
          color,
          featured
        }
        tags.update(tag)
      } else {
        tags.add({
          name: name,
          slug: slug ?? parameterize(name),
          href: tagHref(slug ?? name),
          icon: icon,
          color: color,
          featured: false,
          posts: []
        })
      }
    })
  } catch (err) {
    if (err['code'] === 'ENOENT') {
      log('tags', `No '${filename}' file found`)
      return []
    }

    throw err
  }
}

export const getTags = async () => {
  const tags = db<Tag>([], {
    index: 'name'
  })

  await getTagsFromFile(tags)

  const posts = await getPosts({ limit: false })

  await asyncForEach(posts, async (post) => {
    const data = await post.data
    data.tags.forEach((tag) => {
      const t = tags.lookup(tag)
      if (t) {
        t.posts.push(post)

        tags.update(t)
      } else {
        tags.add({
          name: tag,
          slug: parameterize(tag),
          href: tagHref(tag),
          icon: null,
          color: DEFAULT_TAG_COLOR,
          featured: false,
          posts: [post]
        })
      }
    })
    // if (data.tags.length == 0) {
    //   const uncategorized = tags.findOneById(0)
    //   if (uncategorized) {
    //     uncategorized.posts.push(post)
    //     tags.update(uncategorized)
    //   }
    // }
  })
  return tags
}

export const getTag = async (tag: string) => {
  const tags = await getTags()

  const slug = parameterize(tag)

  return tags.findOne({ slug: { is: slug } })
}
