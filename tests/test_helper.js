const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: "Hello, World",
    author: "Jake Burton",
    url: "github.io",
    likes: 77
  },
  {
    title: "Hey Jake",
    author: "Maya Judge",
    url: "facebook.com",
    likes: 48
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = { initialBlogs, blogsInDb }