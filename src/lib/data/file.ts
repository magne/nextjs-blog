import fs from 'fs'
import matter from 'gray-matter'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import path from 'path'
import { defaults } from '../../utils'
import { asyncMap } from '../../utils/functions/async-map'
import { log } from '../functions/log'
import { prepareMarkdown, prepareMdx, prepareMdxRemote } from '../functions/prepare-mdx'

const { readFile, readdir, stat } = fs.promises

const fileCache: Record<string, File<any, any>> = {}

export interface BaseProperties {
  bundleDirectory: string
}

export type Variant = 'unified' | 'bundler' | 'remote'

export type File<Frontmatter extends {}, Properties extends BaseProperties> = {
  readonly contents: Promise<string>
  readonly data: Promise<Frontmatter & Properties>
  readonly bundle: Promise<{ variant: Variant; bundle: string | MDXRemoteSerializeResult }>
  readonly file: {
    directory: string
    extension: string
    path: string
    rawContents: string
  }
  readonly index: number
  clear: () => void
  getProperty: (property: keyof (Frontmatter & Properties)) => Promise<any>
  readonly properties: Properties
}

export const file = <Frontmatter extends {}, Properties extends BaseProperties>(
  filePath: string,
  properties: Properties
): File<Frontmatter, Properties> => {
  if (!fileCache[filePath]) {
    log('file', `new file ${filePath}`)
    fileCache[filePath] = createFile(filePath, properties)
  }

  return fileCache[filePath] as File<Frontmatter, Properties>
}

const createFile = <Frontmatter extends {}, Properties extends BaseProperties>(
  filePath: string,
  properties: Properties
): File<Frontmatter, Properties> => {
  let rawContents: string
  let contents: string
  let frontmatter: Frontmatter
  let bundle: string | MDXRemoteSerializeResult
  let variant: Variant
  let bundlePromise: Promise<string | MDXRemoteSerializeResult>

  if (process.env.NODE_ENV === 'development') {
    fs.watch(filePath, {}, (event) => {
      if (event === 'change' && typeof rawContents === 'string') {
        clear()
      }
    })
  }

  const getRawContents = async () => {
    log('file', `got contents of ${filePath}`)
    rawContents = (await readFile(filePath)).toString()
  }

  const getContents = () => {
    const parsed = matter(rawContents)

    contents = parsed.content
  }

  const getFrontmatter = () => {
    const parsed = matter(rawContents)

    frontmatter = parsed.data as any
  }

  const clear = () => {
    log('file', `clearing cache (${filePath})`)
    rawContents = undefined as unknown as string
    contents = undefined as unknown as string
    frontmatter = undefined as unknown as Frontmatter
    bundle = undefined as unknown as string | MDXRemoteSerializeResult
    variant = undefined as unknown as Variant
  }

  const file = {
    directory: path.dirname(filePath),
    extension: path.extname(filePath),
    path: filePath,
    // @ts-ignore
    rawContents
  }

  const getVariant = async () => {
    if (typeof rawContents !== 'string') {
      await getRawContents()
    }

    if (frontmatter == undefined) {
      getFrontmatter()
    }

    if (frontmatter.hasOwnProperty('variant')) {
      const _variant = frontmatter['variant' as keyof Frontmatter] as unknown as string
      if (['unified', 'bundler', 'remote'].includes(_variant)) {
        variant = _variant as Variant
      }
    }

    if (variant === undefined) {
      variant = file.extension === '.md' ? 'unified' : 'bundler'
    }
  }

  return {
    properties,
    index: Object.keys(fileCache).length,
    file,
    clear,
    getProperty: async (property: keyof (Frontmatter & Properties)) => {
      if (properties.hasOwnProperty(property)) {
        return properties[property as keyof Properties]
      }

      if (typeof rawContents !== 'string') {
        await getRawContents()
      }

      if (typeof frontmatter === 'undefined') {
        getFrontmatter()
      }

      return frontmatter[property as keyof Frontmatter]
    },
    get contents(): Promise<string> {
      return (async () => {
        if (typeof rawContents !== 'string') {
          await getRawContents()
        }

        if (typeof contents !== 'string') {
          getContents()
        }

        return contents
      })()
    },
    get data(): Promise<Frontmatter & Properties> {
      return (async () => {
        if (typeof rawContents !== 'string') {
          await getRawContents()
        }

        if (typeof frontmatter === 'undefined') {
          getFrontmatter()
        }

        return {
          ...frontmatter,
          ...properties
        }
      })()
    },
    get bundle(): Promise<{ variant: Variant; bundle: string | MDXRemoteSerializeResult }> {
      return (async () => {
        if (typeof rawContents !== 'string') {
          await getRawContents()
        }

        if (typeof contents !== 'string') {
          getContents()
        }

        if (typeof bundle === 'undefined') {
          if (!bundlePromise) {
            if (variant === undefined) {
              await getVariant()
            }
            if (variant == 'unified') {
              bundlePromise = prepareMarkdown(contents)
            } else if (variant == 'remote') {
              bundlePromise = prepareMdxRemote(contents)
            } else {
              bundlePromise = prepareMdx(contents, {
                directory: file.directory,
                imagesUrl: properties.bundleDirectory
              })
            }
          }

          bundle = await bundlePromise
        }

        return { variant, bundle }
      })()
    }
  }
}

export interface ContentQueryParameters<Frontmatter extends {}, Properties extends BaseProperties> {
  limit: number | false
  orderBy: keyof (Frontmatter & Properties)
  /** Only works if `limit` is defined */
  skip: number
  order: 'ASC' | 'DESC'
}

async function filterAsync<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
  const filterMap = await asyncMap(array, callbackfn)
  return array.filter((value, index) => filterMap[index])
}

export const getFiles = <Frontmatter extends {}, Properties extends BaseProperties>({
  directory,
  getProperties,
  defaultQueryParameters,
  predicate,
  getFilePath
}: {
  directory: string
  getProperties: (filePath: string) => Properties
  defaultQueryParameters: ContentQueryParameters<Frontmatter, Properties>
  predicate?: (directory: string, name: string) => Promise<boolean>
  getFilePath?: (dir: string) => string
}): ((
  query?: Partial<ContentQueryParameters<Frontmatter, Properties>>
) => Promise<File<Frontmatter, Properties>[]>) => {
  return async (query) => {
    const { limit, orderBy, skip, order } = defaults(query, defaultQueryParameters)

    let dirs = await readdir(directory)

    let files = (await filterAsync(dirs, async (dir) => (predicate ? await predicate(directory, dir) : true))).map(
      (dir) => {
        const filePath = getFilePath ? getFilePath(dir) : path.join(directory, dir, 'index.mdx')

        return file<Frontmatter, Properties>(filePath, getProperties(filePath))
      }
    )

    const sortOnMap = await asyncMap(files, async (entry, index) => {
      const value = await entry.getProperty(orderBy)

      return { index, value }
    })

    const sorted = sortOnMap.sort((a, b) => a.value - b.value)

    files = sorted.map(({ index }) => files[index])

    if (order === 'DESC') {
      files = files.reverse()
    }

    if (limit !== false) {
      files = files.slice(skip, skip + limit)
    }

    return files
  }
}
