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

const app = express()
const port = config.get('port') || 5000
const dbUrl = config.get('mongoUri')

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
                        socket.emit('auth_result', { error: 'Unable to verify provided jwt' })
                    }
                } else {
                    socket.emit('auth_result', { error: 'Unable to verify provided jwt' })
                }
            })

            socket.on('sign_up', async (data) => {
                const { email, login, password } = data

                if (await User.findOne({ email })) {
                    socket.emit('auth_result', { error: 'User with that email already exists' })
                    return
                }

                if (await User.findOne({ login })) {
                    socket.emit('auth_result', { error: 'User with that login already exists' })
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
                console.log(data)

                const user = await User.findOne({ login })
                if (!user) {
                    socket.emit('auth_result', { error: "User does not exist" })
                    return
                }

                const isMatch = await bcrypt.compare(password, user.hashedPassword)
                if (!isMatch) {
                    socket.emit('auth_result', { error: "Invalid password" })
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
                    let { imageId } = data
                    let images = await Image.find({ _id: imageId })
                    socket.emit('get_image_result', { images: images })
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
                        imagePath: imageName,
                        uploadDate,
                        authorId: user.id
                    })

                    await image.save()
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

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/images/' + req.originalUrl)
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
