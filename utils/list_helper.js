const logger = require('./logger')
const lodash = require('lodash')

const dummy = (blogs) => {
  logger.info('dummy blogs.length', blogs.length)
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.length === 0
    ? 0
    : blogs.reduce( reducer, 0)
}

const favoriteBlog  = (blogs) => {
  const likesArray = blogs.map(blog => blog.likes)
  return blogs[likesArray
    .findIndex((likes) => likes === Math.max(...likesArray))]
}

const mostBlogs = (blogs) => {
  const countsObj = lodash.countBy(blogs.map(blog => blog.author))
  console.log('Object.values(countsObj)', Object.values(countsObj))
  const vals = Object.values(countsObj)
  const maxVal = Math.max(...vals)
  console.log('max', maxVal)
  const authors = Object.entries(countsObj).find( entry => {
    console.log('entry', entry)
    return entry[1] === maxVal
  })
  return authors[0]
}
module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}