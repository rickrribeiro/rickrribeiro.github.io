import { request, gql } from 'graphql-request'

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT || ''

class DataService {
  async getPosts() {
    const query = gql`
      query MyQuery {
        postsConnection {
          edges {
            cursor
            node {
              author {
                bio
                name
                id
                photo {
                  url
                }
              }
              createdAt
              slug
              title
              excerpt
              featuredImage {
                url
              }
              categories {
                name
                slug
              }
            }
          }
        }
      }
    `

    const result: any = await request(graphqlAPI, query) // TODO - fix type

    return result.postsConnection.edges
  }

  async getCategories() {
    const query = gql`
      query GetGategories {
        categories {
          name
          slug
        }
      }
    `

    const result: any = await request(graphqlAPI, query) // TODO - fix type

    return result.categories
  }

  async getPostDetails(slug: string) {
    const query = gql`
      query GetPostDetails($slug: String!) {
        post(where: { slug: $slug }) {
          title
          excerpt
          featuredImage {
            url
          }
          author {
            name
            bio
            photo {
              url
            }
          }
          createdAt
          slug
          content {
            raw
          }
          categories {
            name
            slug
          }
        }
      }
    `

    const result: any = await request(graphqlAPI, query, { slug }) //TODO- fix type

    return result.post
  }

  async getSimilarPosts(slug: string, categories: string[]) {
    const query = gql`
      query GetPostDetails($slug: String!, $categories: [String!]) {
        posts(
          where: {
            slug_not: $slug
            AND: { categories_some: { slug_in: $categories } }
          }
          last: 3
        ) {
          title
          featuredImage {
            url
          }
          createdAt
          slug
        }
      }
    `
    const result: any = await request(graphqlAPI, query, { slug, categories }) // TODO - FIX TYPE

    return result.posts
  }

  async getAdjacentPosts(createdAt: string, slug: string) {
    const query = gql`
      query GetAdjacentPosts($createdAt: DateTime!, $slug: String!) {
        next: posts(
          first: 1
          orderBy: createdAt_ASC
          where: { slug_not: $slug, AND: { createdAt_gte: $createdAt } }
        ) {
          title
          featuredImage {
            url
          }
          createdAt
          slug
        }
        previous: posts(
          first: 1
          orderBy: createdAt_DESC
          where: { slug_not: $slug, AND: { createdAt_lte: $createdAt } }
        ) {
          title
          featuredImage {
            url
          }
          createdAt
          slug
        }
      }
    `

    const result: any = await request(graphqlAPI, query, { slug, createdAt }) // todo- fix type

    return { next: result.next[0], previous: result.previous[0] }
  }

  async getCategoryPost(slug: string) {
    const query = gql`
      query GetCategoryPost($slug: String!) {
        postsConnection(where: { categories_some: { slug: $slug } }) {
          edges {
            cursor
            node {
              author {
                bio
                name
                id
                photo {
                  url
                }
              }
              createdAt
              slug
              title
              excerpt
              featuredImage {
                url
              }
              categories {
                name
                slug
              }
            }
          }
        }
      }
    `

    const result: any = await request(graphqlAPI, query, { slug }) //todo fix type

    return result.postsConnection.edges
  }
  async getFeaturedPosts() {
    const query = gql`
    query GetCategoryPost() {
      posts(where: {featuredPost: true}) {
        author {
          name
          photo {
            url
          }
        }
        featuredImage {
          url
        }
        title
        slug
        createdAt
      }
    }   
  `

    //todo fix tyype
    const result: any = await request(graphqlAPI, query)

    return result.posts
  }
  // async submitComment(obj: any) {
  //   //todo fix tyype
  //   const result: any = await fetch(`${graphqlAPI}/api/comments`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(obj)
  //   })

  //   return result.json()
  // }
  async getComments(slug: string) {
    const query = gql`
      query GetComments($slug: String!) {
        comments(where: { post: { slug: $slug } }) {
          name
          createdAt
          comment
        }
      }
    `

    //todo fix tyype
    const result: any = await request(graphqlAPI, query, { slug })

    return result.comments
  }
  async getRecentPosts() {
    const query = gql`
    query GetPostDetails() {
      posts(
        orderBy: createdAt_ASC
        last: 3
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `
    //todo fix tyype
    const result: any = await request(graphqlAPI, query)

    return result.posts
  }
}
export default DataService
