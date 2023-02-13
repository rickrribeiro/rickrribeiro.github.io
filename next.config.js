// next.config.js

const isGithubActions = process.env.GITHUB_ACTIONS || false

let assetPrefix = ''
let basePath = '/'

if (isGithubActions) {
  // trim off `<owner>/`
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '')

  assetPrefix = `/${repo}/`
  basePath = `/base`
}

module.exports = {
  assetPrefix: assetPrefix,
  basePath: basePath
  // images: {
  //   loader: 'imgix',
  //   path: 'the "domain" of your Imigix source',
  // },
}
