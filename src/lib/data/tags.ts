import { db } from 'sodb'
import { asyncForEach } from '../../utils/functions/async-for-each'
import { parameterize } from '../../utils/functions/parameterize'
import { tagHref } from '../functions/tag-href'
import { File } from './file'
import { getPosts, PostFrontmatter, PostProperties } from './posts'

interface Tag {
  name: string
  slug: string
  href: string
  posts: File<PostFrontmatter, PostProperties>[]
}

export const getTags = async () => {
  const posts = await getPosts({ limit: false })

  const tags = db<Tag>([], {
    index: 'name'
  })

  await asyncForEach(posts, async (post) => {
    ;(await post.data).tags.forEach((tag) => {
      const t = tags.lookup(tag)
      if (t) {
        t.posts.push(post)

        tags.update(t)
      } else {
        tags.add({
          name: tag,
          slug: parameterize(tag),
          href: tagHref(tag),
          posts: [post]
        })
      }
    })
  })

  return tags
}

export const getTag = async (tag: string) => {
  const tags = await getTags()

  const slug = parameterize(tag)

  return tags.findOne({ slug: { is: slug } })
}
