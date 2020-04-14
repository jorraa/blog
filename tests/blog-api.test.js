const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)
const User = require('../models/user')
const bcrypt = require('bcrypt')

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are six blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('Identificating field "id" must exists in a blog', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined() === true
  })
})

describe('addition of a new blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'ben', passwordHash, name: 'Ben Bloggaaja' })

    await user.save()
    // in blogs router test env käyttää beniä
  })

  test('a valid blog can be added to blogs', async () => {
    const blogsInStart = helper.blogsInDb

    const newBlog = {
      author: 'JR',
      title: 'async/await simplifies making async callsJR',
      url: 'https://jorma.com/',
      likes: 5
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsInStart.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain(
      'async/await simplifies making async callsJR'
    )
    const savedBlog = new Blog(response.body)
    expect(savedBlog.user.id).toBeDefined()

    const blogs = await Blog
      .find({ author: 'JR' })
      .populate('user', { username: 1, name: 1 })

    const myBlog = blogs[0]

    expect(myBlog.user.name).toBe('Ben Bloggaaja')
  })

  test('blog without title is not added', async () => {
    //const blogsAtStart = helper.blogsInDb()

    const newBlog = {
      author: 'JR',
      url: 'https://jorma.com',
      likes: 4
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(0)
  })

  test('blog without url is not added', async () => {
    const blogsAtStart = helper.blogsInDb
    const newBlog = {
      author: 'JR',
      title: 'Hienoko homma?',
      likes: 4
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })

  test('blog without "likes" value is added with likes=0', async () => {
    const newBlog = {
      author: 'JR',
      title: 'async/await simplifies making async callsJR',
      url: 'https://jorma.com/'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)

    const likes = response.body.likes
    expect(likes).toBe(0)
  })
})

describe('viewing a specific blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })
})

describe('deletion of a blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })
  test('updating likes of a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    //surely differs from original
    const newLikes = 9651 !== blogToUpdate.likes?9651:9855

    blogToUpdate.likes = newLikes

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    const likes = response.body.likes
    expect(likes).toBe(newLikes)
  })
})

describe('showing blogs with user info ', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'ben', passwordHash, name: 'Ben Bloggaaja' })
    await user.save()
    // in blogs router test env käyttää beniä

    const title = 'Penan puutarhassa'
    const author = 'Pena Paasaaja'
    const url = 'https://bestblogs.com'
    const likes = 1
    const blog = new Blog({ title: title, author: author, url: url, likes: likes })
    blog.user = user.id

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
  })

  test('show blogs with userinfo', async () => {

    const response = await api
      .get('/api/blogs')
      .expect(200)
    const blog = response.body[0]
    console.log('blog with user', blog.user)
    expect('ben').toBe(blog.user.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
})