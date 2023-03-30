import Head from 'next/head'
import { PostCard, Categories, PostWidget } from '@/components'
const posts = [
  {
    title: 'React Next Test Deploy Tailwind',
    excerpt: 'test',
    id: '1',
    slug: '',
    content: '',
    imageUrl: '',
    authorId: ''
  },
  {
    title: 'React Next Test Deploy2 Tailwind',
    excerpt: 'test2',
    id: '2',
    slug: '',
    content: '',
    imageUrl: '',
    authorId: ''
  }
]

export default function Home() {
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
          {posts.map((post, index) => (
            <PostCard key={index} post={post} />
          ))}
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
