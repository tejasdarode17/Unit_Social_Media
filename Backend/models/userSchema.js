const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
    },
    profilePhoto: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    },
    profilePhotoID: {
        type: String
    },
    bio: {
        type: String
    },
    followers: [
        {

            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {

            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog"
        }
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },

    googleVerified: {
        type: Boolean,
        default: false,
    }

})


const User = mongoose.model("User", userSchema)



module.exports = User