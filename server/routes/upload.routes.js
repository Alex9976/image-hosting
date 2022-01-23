const { Router } = require('express')
const Image = require('../models/Image')
const config = require('config')
const { verifyToken } = require('../helpers/TokenAssistant')
const multer = require('multer')
const router = Router()
const path = require("path")

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.get('imageSavePath'))
    },
    filename: (req, file, cb) => {
        cb(null, getRandomString(20) + '-' + Date.now() + path.extname(file.originalname))
    }
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

router.post('/', verifyToken, async function (req, res) {
    try {
        let upload = multer({ storage: storageConfig }).single('image')
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                console.log(err)
                res.status(500).json({
                    message: "Something went wrong..."
                })
                return
            } else if (err) {
                console.log(err)
                res.status(500).json({
                    message: "Something went wrong..."
                })
                return
            }

            console.log('Successfully received file ' + req.file.filename)

            const fileName = req.file.filename
            const title = req.body.title
            const authorId = req.user.userId
            const image = new Image({
                title,
                imageName: fileName,
                authorId
            })

            await image.save()

            res.json({
                message: "Successfully uploaded file"
            })

            return
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Something went wrong..."
        })
    }
})

module.exports = router