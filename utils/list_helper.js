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

module.exports = { dummy, totalLikes, favoriteBlog }