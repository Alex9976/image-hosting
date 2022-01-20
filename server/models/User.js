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
})

module.exports = model('User', schema)