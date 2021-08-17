import { parameterize } from '../../utils/functions/parameterize'

export const tagHref = (name: string) => {
  return `/tags/${parameterize(name)}`
}
