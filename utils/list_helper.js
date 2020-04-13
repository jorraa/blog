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
  console.log('likesObj', likesObj)

  let resArr = []
  Object.entries(likesObj).forEach( o => {
    // console.log('OOO', o)
    let sum = 0
    Object.values(o[1]).forEach(v => {
      sum += v[1]
    })
    //console.log('sum',sum)
    o[1] = sum
    //console.log('OOOsum', o)
    resArr.push(o)
  })
  console.log('resArr----', resArr)
  const likesArray = resArr.map(author => author[1])
  const maxCount = Math.max(...likesArray)
  console.log('max', maxCount)
  const result = resArr.find(o => o[1] === maxCount)
  console.log('found', result)


  //console.log('reduced', reduced2)


  /*
  // countsObj [{author, countOfBlogs} ...]
  const countsObj = lodash.countBy(blogs.map(blog => blog.author))
  const maxVal = Math.max(...Object.values(countsObj))

  const author = Object.entries(countsObj)
    .find( entry => {
      return entry[1] === maxVal
    })[0] // at least one author
  return { 'author': author, 'blogsCount': maxVal }
  */
  const author = result[0]
  const likesCount = result[1]
  return { 'author': author, 'likesCount': likesCount }
}
module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}