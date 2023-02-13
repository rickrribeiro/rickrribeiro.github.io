// import type PostInterface from './PostInterface'

export default interface CategoryInterface {
  id: string
  name: string
  slug: string
  posts?: string[] // PostInterface
}
