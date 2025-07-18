const mongoose = require("mongoose");


const blogSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    draft: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    },
    imageID: {
        type: String
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
}, {
    timestamps: true 
});



const Blog = mongoose.model("Blog", blogSchema)



module.exports = Blog

