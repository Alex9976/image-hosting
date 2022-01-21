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
    createDate: {
        type: Date,
        required: true,
        default: new Date().toISOString()
    },
})

module.exports = model('User', schema)