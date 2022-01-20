const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    login: {
        type: String,
        required: true,
        unique: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    likedImagesId: [{
        type: Types.ObjectId,
        ref: 'Image'
    }],
    comments: [{
        type: Types.ObjectId,
        ref: 'Comment'
    }]
})

module.exports = model('User', schema)