import path from 'path'

export const CONTENT_DIRECTORY = path.join(process.cwd(), 'content')

export const metadata: {
  title: string
  description: string
  topics: string[]
} = {
  title: 'Next.js Sample Website',
  description: 'A Gatsby theme for %TOPICS%',
  topics: ['bloggers', 'geeks', 'nerds', 'people', 'everyone']
}
