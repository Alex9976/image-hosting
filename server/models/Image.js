const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    title: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    uploadDate: {
        type: String,
        required: true
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
    comments: [{
        type: Types.ObjectId,
        ref: 'Comment'
    }]
})

module.exports = model('Image', schema)