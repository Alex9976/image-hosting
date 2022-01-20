const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    text: {
        type: String,
        required: true
    },
    imageId: {
        type: Types.ObjectId,
        ref: 'Image',
        required: true
    },
    authorId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
})

module.exports = model('Comment', schema)