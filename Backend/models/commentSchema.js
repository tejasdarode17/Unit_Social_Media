const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Blog"
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],


    // nested Comment

    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
    ],

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
})


const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment

