const _ = require('lodash')

const dummy = () => {
    return 1
}

const totalLikes = blogs => {
    return blogs.reduce((total, current) => total += current.likes, 0)
}

const favoriteBlog = blogs => {
    return blogs.reduce((best, current) => {
        if (!best) return current;
        return current.likes > best.likes ? current : best
    })
}

const mostBlogs = blogs => {
    const authors = blogs.map(blog => blog.author)
    const counts = _.countBy(authors)
    return Object.entries(counts).reduce((max, current) => {
        const author = current[0]
        const blogs = current[1]
        const authorObject = {author, blogs}
        if (!max) return authorObject
        return authorObject.blogs > max.blogs ? authorObject : max
    }, null)
}

const mostLikes = blogs => {
    const grouped = _.groupBy(blogs, blog => blog.author)
    return Object.entries(grouped).reduce((best, current) => {
        const author = current[0]
        const likes = totalLikes(current[1])
        const object = {author, likes}
        if (!best) return object
        return object.likes > best.likes ? object : best
    }, null)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}