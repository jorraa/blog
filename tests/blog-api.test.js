const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
  console.log('beforeEach done')
})

describe('when there is initially some notes saved', () => {
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

describe('addition of a new note', () => {
  test('a valid note can be added ', async () => {
    const newBlog = {
      author: 'JR',
      title: 'async/await simplifies making async callsJR',
      url: 'https://jorma.com/',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    console.log('titles', titles)
    expect(titles).toContain(
      'async/await simplifies making async callsJR'
    )
  })

  test('blog without title is not added', async () => {
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

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without url is not added', async () => {
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

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
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

describe('viewing a specific note', () => {
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
describe('deletion of a note', () => {
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
afterAll(() => {
  mongoose.connection.close()
})