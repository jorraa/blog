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
  if(blogs.length === 0) { return {} }
  const likesArray = blogs.map(blog => blog.likes)
  return blogs[likesArray
    .findIndex((likes) => likes === Math.max(...likesArray))]
}

const mostBlogs = (blogs) => {
  if(blogs.length === 0) {
    return { 'author': '', 'blogsCount': 0 }
  }
  // countsObj [{author, countOfBlogs} ...]
  const countsObj = lodash.countBy(blogs.map(blog => blog.author))
  const maxCount = Math.max(...Object.values(countsObj))

  const author = Object.entries(countsObj)
    .find( entry => {
      return entry[1] === maxCount
    })[0] // at least one author
  return { 'author': author, 'blogsCount': maxCount }
}

const mostLikes = (blogs) => {
  if(blogs.length === 0) {
    return { 'author': '', 'likesCount': 0 }
  }

  // taking only needed values in array
  const pickedArr = blogs.map(blog => [blog.author, blog.likes])
  // collecting under author
  const likesObj = lodash.groupBy(pickedArr, (arr) => arr[0])

  // no power left to search lib for next two
  const calcLikes = (authorEntry, sum) => {
    Object.values(authorEntry[1]).forEach(v => sum += v[1])
    return sum
  }

  const createAuthorLikesArr = (likesObj) => {
    let resp = []
    Object.entries(likesObj).forEach( authorEntry => {
      authorEntry[1] = calcLikes(authorEntry, 0)
      resp.push(authorEntry)
    })
    return resp
  }
  const authorLikes = createAuthorLikesArr(likesObj)

  const maxCount = Math.max(...authorLikes.map(author => author[1]))
  const result = authorLikes.find(o => o[1] === maxCount)

  return { 'author': result[0], 'likesCount': result[1] }
}
module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}