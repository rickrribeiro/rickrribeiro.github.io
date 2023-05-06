import Head from 'next/head'
import { PostCard, Categories, PostWidget } from '@/components'
import { DataService } from '../services/index'
import { PostInterface } from '@/interfaces'
import { Key } from 'react'

const dataService = new DataService()

export default function Home({ posts }: any) {
  // todo - fix type
  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>Rickrribeiro</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <FeaturedPosts /> */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 col-span-1">
          {posts.map(
            (post: { node: PostInterface }, index: Key | null | undefined) => (
              <PostCard key={index} post={post.node} />
            )
          )}
        </div>
        <div className="lg:col-span-4 col-span-1">
          <div className="lg:sticky relative top-8">
            <PostWidget />
            <Categories />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps() {
  const posts = (await dataService.getPosts()) || []
  return {
    props: { posts }
  }
}
