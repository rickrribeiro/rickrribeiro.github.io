// // next.config.js

// const isGithubActions = process.env.GITHUB_ACTIONS || false
// let configs

// if (isGithubActions) {
//   let assetPrefix = ''
//   let basePath = '/'
//   // trim off `<owner>/`
//   const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '')

//   assetPrefix = `/${repo}/`
//   basePath = `/${repo}`
//   configs = {
//     assetPrefix: assetPrefix,
//     basePath: basePath
//     // images: {
//     //   loader: 'imgix',
//     //   path: 'the "domain" of your Imigix source',
//     // },
//   }
// } else {
//   configs = {
//     experimental: {
//       appDir: true
//     }
//   }
// }

// module.exports = configs

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     appDir: true
//   }
// }

// module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'akamai',
    path: ''
  },
  assetPrefix: './'
}

export default nextConfig
