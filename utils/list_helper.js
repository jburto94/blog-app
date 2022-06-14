const _ = require('lodash')

const dummy = array => {
  return 1
}

const totalLikes = array => {
  if (array.length === 0) {
    return 0
  }

  let total = 0
  array.forEach(blog => total += blog.likes)

  return total
}

const favoriteBlog = array => {
  if (array.length === 0) {
    return {}
  }

  mostLikes = Math.max(...array.map(blog => blog.likes))

  topBlog = array.find(blog => blog.likes === mostLikes)

  return {
    title: topBlog.title,
    author: topBlog.author,
    likes: topBlog.likes
  }
}

const mostBlogs = array => {
  if (array.length === 0) {
    return {}
  }

  const authorCount = _.countBy(array, 'author')

  const topAuthor = Object.keys(authorCount).reduce((a, b) => authorCount[a] > authorCount[b] ? a : b)
  return {
    author: topAuthor,
    blogs: authorCount[topAuthor]
  }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs }