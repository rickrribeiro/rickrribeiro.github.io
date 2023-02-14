import Head from 'next/head'

const posts = [
  { title: 'React Next Test Deploy Tailwind', excerpt: 'test' },
  { title: 'React Next Test Deploy2 Tailwind', excerpt: 'test2' }
]

export default function Home() {
  return (
    <div className="container mx-auto px-10 mb-8 bg-red-500">
      <Head>
        <title>Rickrribeiro</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-red-500">
        {posts.map((post, index) => (
          <div key={index}>
            {post.title} {post.excerpt}
          </div>
        ))}
      </div>
    </div>
  )
}
