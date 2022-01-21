const express = require('express')
const path = require('path')
const config = require('config')
const mongoose = require('mongoose')
const socket = require('socket.io')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Image = require('./models/Image')
const Comment = require('./models/Comment')
const fs = require('file-system');
const verifyToken = require('./verifyToken.middleware')
const cors = require('cors')

const app = express()
const port = config.get('port') || 5000
const dbUrl = config.get('mongoUri')
app.use(cors())
app.use('/api/upload', require('./routes/upload.routes'))

async function start() {
    try {
        console.log(`Connecting to MongoDB with uri ${dbUrl}`)

        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        const server = app.listen(port, () => {
            console.log(`Listening at port ${port}`)
        })

        const io = socket(server)

        io.on('connection', (socket) => {
            console.log('New connection with id = ' + socket.id)

            socket.on('restore_auth', (data) => {
                if (data) {
                    let { jwt } = data
                    if (verifyJwt(jwt)) {
                        socket.emit('auth_result', { jwt })
                    } else {
                        socket.emit('auth_result', { error: 'Unable to verify provided jwt', type: 'auth' })
                    }
                } else {
                    socket.emit('auth_result', { error: 'Unable to verify provided jwt', type: 'auth' })
                }
            })

            socket.on('sign_up', async (data) => {
                const { email, login, password } = data

                if (await User.findOne({ email })) {
                    socket.emit('auth_result', { error: 'User with that email already exists', type: 'signUp' })
                    return
                }

                if (await User.findOne({ login })) {
                    socket.emit('auth_result', { error: 'User with that login already exists', type: 'signUp' })
                    return
                }

                const hashedPassword = await bcrypt.hash(password, 12)
                const user = new User({
                    email,
                    login,
                    hashedPassword
                })

                await user.save()
                const jwt = createToken(user)
                socket.emit('auth_result', { jwt })
            })

            socket.on('sign_in', async (data) => {
                const { login, password } = data

                const user = await User.findOne({ login })
                if (!user) {
                    socket.emit('auth_result', { error: 'User does not exist', type: 'signIn' })
                    return
                }

                const isMatch = await bcrypt.compare(password, user.hashedPassword)
                if (!isMatch) {
                    socket.emit('auth_result', { error: 'Invalid password', type: 'signIn' })
                    return
                }

                const jwt = createToken(user)
                socket.emit('auth_result', { jwt })
            })

            socket.on('get_images', async () => {
                let images = await Image.find({})
                socket.emit('get_images_result', { images: images })
            })

            socket.on('get_image', async (data) => {
                if (data) {
                    let { jwt, imageId } = data
                    var isLiked = false
                    var isAuth = false
                    var isCanDelete = false
                    let image = await Image.findById(imageId)
                    if (jwt) {
                        let decoded = verifyJwt(jwt)
                        if (decoded) {
                            isAuth = true
                            const user = await User.findById(decoded.userId)
                            var likedImages = user.likedImagesId
                            const index = likedImages.indexOf(imageId)
                            if (index !== -1) {
                                isLiked = true
                            }
                            if (decoded.userId === image.authorId.toString()) {
                                isCanDelete = true
                            }
                            socket.emit('get_image_result', { image, isLiked, isAuth, isCanDelete })
                        }
                    }
                    else {
                        socket.emit('get_image_result', { image, isLiked, isAuth, isCanDelete })
                    }
                }
            })

            socket.on('image_like', async (data) => {
                if (data) {
                    let { id, jwt } = data
                    let decoded = verifyJwt(jwt)
                    if (decoded) {
                        try {
                            const user = await User.findById(decoded.userId)
                            const image = await Image.findById(id)

                            var likedImagesByUser = user.likedImagesId
                            var imageLikesCount = image.likes

                            const index = likedImagesByUser.indexOf(id);
                            let isLiked = false
                            if (index !== -1) {
                                likedImagesByUser.splice(index, 1);
                                imageLikesCount--
                            } else {
                                isLiked = true
                                likedImagesByUser.push(id)
                                imageLikesCount++
                            }

                            await User.findByIdAndUpdate(decoded.userId, {
                                likedImagesId: likedImagesByUser
                            }, {
                                upsert: true,
                                useFindAndModify: false
                            })


                            await Image.findByIdAndUpdate(id, {
                                likes: imageLikesCount
                            }, {
                                upsert: true,
                                useFindAndModify: false
                            })

                            socket.emit('image_like_result', { likes: imageLikesCount, isLiked })
                        } catch (e) {
                            socket.emit('image_like_result', { likes: -1 })
                        }
                    } else {
                        socket.emit('auth_result', { error: 'Unable to verify provided jwt' })
                    }
                } else {
                    socket.emit('auth_result', { error: 'Unable to verify provided jwt' })
                }
            })

            socket.on('delete_image', async (data) => {
                if (data) {
                    let { id, jwt } = data
                    let decoded = verifyJwt(jwt)
                    if (decoded) {
                        const image = await Image.findById(id)
                        if (image.authorId.toString() === decoded.userId) {
                            const imageFilePath = path.join('./images', image.imageName)

                            const users = await User.find({ likedImagesId: id })

                            for (var i = 0; i < users.length; i++) {
                                const user = users[0]

                                var likedImagesByUser = user.likedImagesId
                                likedImagesByUser.splice(likedImagesByUser.indexOf(id), 1)

                                await User.findByIdAndUpdate(user._id, {
                                    likedImagesId: likedImagesByUser
                                }, {
                                    upsert: true,
                                    useFindAndModify: false
                                })
                            }

                            await Image.findOneAndDelete({ _id: id })

                            fs.unlink(imageFilePath, function (err) {
                                if (err) return console.log(err);
                                console.log(imageFilePath + ' deleted successfully');
                            });

                            socket.emit('delete_inage_result', {})
                        }
                        else {
                            socket.emit('auth_result', { error: 'Forbidden' })
                        }
                    } else {
                        socket.emit('auth_result', { error: 'Unable to verify provided jwt' })
                    }
                } else {
                    socket.emit('auth_result', { error: 'Unable to verify provided jwt' })
                }
            })

            socket.on('upload_image', async (data) => {
                let { jwt, fileName, title, file } = data
                let decoded = verifyJwt(jwt)
                const fName = fileName
                if (decoded) {
                    const user = await User.findById(decoded.userId)
                    const buffer = Buffer.from(file);
                    const date = new Date().toLocaleString().replaceAll(':', '.').replaceAll(' ', '')
                    const uploadDate = new Date().toISOString()
                    const extention = fName.substring(fName.lastIndexOf('.'))
                    const imageName = date + getRandomString(20) + extention

                    await fs.writeFile(path.join('./images/', imageName), buffer, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    })

                    const image = new Image({
                        title,
                        imageName,
                        uploadDate,
                        authorId: user.id
                    })

                    await image.save()

                    let images = await Image.find({})
                    socket.broadcast.emit('get_images_result', { images: images })
                }
            })
        })

        io.on('disconnect', async () => {
            console.log('Client disconnected with id = ' + socket.id)
        })

    } catch (e) {
        console.log(`Server error: ${e.message}`)
        process.exit(1)
    }
}

function createToken(user) {
    return jwt.sign(
        { userId: user.id },
        config.get('jwtSecret'),
        { expiresIn: '1h' }
    )
}

function verifyJwt(token) {
    try {
        if (!token) {
            return null
        }
        return jwt.verify(token, config.get('jwtSecret'))
    } catch {
        return null
    }
}

start()

app.get('/file/:id', async (req, res) => {
    const image = await Image.findById(req.params.id)
    res.sendFile(__dirname + '/images/' + image.imageName)
})

function getRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMNOPQRSTUVWXZ0123456789'
    let str = ''
    for (let i = 0; i < length; i++) {
        const pos = Math.floor(Math.random() * chars.length)
        str += chars.substring(pos, pos + 1)
    }
    return str
}
