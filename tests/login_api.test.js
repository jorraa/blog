const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const api = supertest(app)
//...

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salasala', 10)
    const user = new User({ username: 'bena', name: 'Ben BArka', passwordHash })

    await user.save()
  })

  test('login succeeds', async () => {

    const credentials = {
      username: 'bena',
      password: 'salasala'
    }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
  })
})

afterAll(() => {
  mongoose.connection.close()
})