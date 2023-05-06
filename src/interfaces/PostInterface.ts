import type AuthorInterface from './AuthorInterface'
// import type CategoryInterface from './CategoryInterface'
// import type CommentInterface from './CommentInterface'

export default interface PostInterface {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: { url: string }
  author: AuthorInterface
  createdAt: string
  views?: number
  categories?: string[] // CategoryInterface[]
  comments?: string[] // CommentInterface
}
