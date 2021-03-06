const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are initial blogs saved', () => {
  test('blogs returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blogs unique identifier is named "id"', async () => {
    const blogs = await helper.blogsInDb()
    const firstBlog = blogs[0]

    expect(firstBlog.id).toBeDefined()
  })
})

describe('when viewing a specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('fails with statuscode 404 if id is valid, but blog does not exist', async() => {
    const validNonExistingBlogId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonExistingBlogId}`)
      .expect(404)
  })

  test('fails with statuscode 404 if id is valid, but blog does not exist', async() => {
    const validNonExistingBlogId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonExistingBlogId}`)
      .expect(404)
  })
})

describe('additon of a new blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'test', name: 'test', password: passwordHash })

    await user.save()

    const userForToken = {
        username: user.username,
        id: user.id,
    }

    token = jwt.sign(userForToken, process.env.SECRET)
    await Blog.deleteMany({})
    blogs = helper.initialBlogs.map(blog => new Blog({ ...blog, user: user.id }))
    await Blog.insertMany(helper.initialBlogs)
  })

  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'New Blog!!!',
      author: 'Peter Ninkonpoop',
      url: 'helloworld.com',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain('New Blog!!!')
  })

  test('with no likes specified will default to 0', async () => {
    const newBlog = {
      title: 'I bet no one will like this',
      author: 'Unlikeable James',
      url: 'alone.com'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)

    blogsAtEnd = await helper.blogsInDb()

    latestBlog = blogsAtEnd[2]
    expect(latestBlog.likes).toEqual(0)
  })

  test('fails with statuscode 400 without title and url', async () => {
    const newBlog = {
      author: 'Anon',
      likes: 121
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'test', name: 'test', password: passwordHash })

    await user.save()

    const userForToken = {
        username: user.username,
        id: user.id,
    }

    token = jwt.sign(userForToken, process.env.SECRET)
    await Blog.deleteMany({})
    blogs = helper.initialBlogs.map(blog => new Blog({ ...blog, user: user.id }))
    await Blog.insertMany(helper.initialBlogs)
  })

  test('succeeds with 204 if id is valid', async () => {
    const newBlog = {
      title: 'gone soon',
      url: '404.com'
    }

    const blogToDelete = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)

    await api
      .delete(`/api/blogs/${blogToDelete.body.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)
  })
})

describe('updating of a blog', () => {
  test(`succeeds with 200 if id is valid`, async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedInfo = {
      ...blogToUpdate,
      title: "First!!! (updated)",
      likes: 78
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedInfo)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd[0]
    expect(updatedBlog.title).toEqual('First!!! (updated)')
    expect(updatedInfo.url).toEqual('github.io')
  })
})

afterAll(() => mongoose.connection.close())