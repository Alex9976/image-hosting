const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    title: {
        type: String,
        default: ''
    },
    imageName: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        required: true,
        default: new Date().toISOString()
    },
    authorId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
})

module.exports = model('Image', schema)