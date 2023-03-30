import React from 'react'
import { PostInterface } from '@/interfaces'

interface PostCardInterface {
  post: PostInterface
}

const PostCard = ({ post }: PostCardInterface) => {
  return (
    <div>
      {post.title}
      {post.excerpt}
    </div>
  )
}

export default PostCard
