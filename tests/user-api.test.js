const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)
const Blog = require('../models/blog')
//...

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('users(root) are returned, as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

  })
})

describe('creating user, when there is initially empty db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jorraa',
      name: 'Jorma Raatikainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with empty username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Jorma Raatikainen',
      password: '123'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error)
      .toContain('User validation failed: username: Path `username` is required.')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with too short(<3) username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jo',
      name: 'Jorma Raatikainen',
      password: '123',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error)
      .toContain('Path `username` (`jo`) is shorter than the minimum allowed length (3)')


    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with empty passord', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jorraa',
      name: 'Jorma Raatikainen',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error)
      .toContain('passord must have at least 3 charachters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with too short(<3) password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jorraa',
      name: 'Jorma Raatikainen',
      password: '12',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error)
      .toContain('passord must have at least 3 charachters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with in db existing username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jorraa2',
      name: 'Jorma Raatikainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    //const usersAfterFirst = await helper.usersInDb()
    //expect(usersAfterFirst).toHaveLength(usersAtStart.length + 1)

    const newUser2 = {
      username: 'jorraa2',
      name: 'Jorma Jokunen',
      password: 'salainen',
    }

    const response = await api
      .post('/api/users')
      .send(newUser2)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error)
      .toContain('User validation failed: username: Error, expected `username` to be unique.')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  })
})

describe('when there is initially one user with one blog in db', () => {
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

  test('show user with blogs', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)

    const user = response.body[0]
    const blog = user.blogs[0]
    expect('Penan puutarhassa').toBe(blog.title)
  })
})
afterAll(() => {
  mongoose.connection.close()
})