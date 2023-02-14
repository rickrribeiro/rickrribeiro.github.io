// next.config.js

const isGithubActions = process.env.GITHUB_ACTIONS || false
let configs

if (isGithubActions) {
  // let assetPrefix = ''
  // let basePath = '/'
  // // trim off `<owner>/`
  // const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '')

  // assetPrefix = `/${repo}/`
  // basePath = `/${repo}`
  // configs = {
  //   assetPrefix: assetPrefix,
  //   basePath: basePath,
  //   images: {
  //     loader: 'akamai',
  //     path: ''
  //   }
  // }
  configs = { reactStrictMode: true }
} else {
  configs = {
    reactStrictMode: true
  }
}

module.exports = configs
