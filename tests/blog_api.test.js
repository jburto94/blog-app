const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))

  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

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

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'New Blog!!!',
    author: 'Peter Ninkonpoop',
    url: 'helloworld.com',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).toContain('New Blog!!!')
})

test('a blog with no likes specified will default to 0', async () => {
  const newBlog = {
    title: 'I bet no one will like this',
    author: 'Unlikeable James',
    url: 'alone.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)

  blogsAtEnd = await helper.blogsInDb()

  latestBlog = blogsAtEnd[2]
  expect(latestBlog.likes).toEqual(0)
})

afterAll(() => mongoose.connection.close())