const cloudinary = require('cloudinary').v2
const dotenv = require("dotenv")
dotenv.config()

async function cloudinaryConfig() {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

    } catch (error) {
        console.log(error)
    }
}

module.exports = cloudinaryConfig