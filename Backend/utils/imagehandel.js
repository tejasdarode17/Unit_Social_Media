const cloudinary = require('cloudinary').v2


async function uploadImage(buffer) {
    try {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "blog app",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(buffer);
        });

        return result;
    } catch (error) {
        throw error;
    }
}

async function deleteImage(publicID) {
    try {
        const result = await cloudinary.uploader.destroy(publicID, {
            folder: "blog app",
            resource_type: "image",
        })

        return result
    } catch (error) {
        throw error
    }
}






module.exports = { uploadImage  , deleteImage}