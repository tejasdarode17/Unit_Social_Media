const Blog = require("../models/blogSchema");
const User = require("../models/userSchema");
const fs = require("fs");
const { uploadImage, deleteImage } = require("../utils/imagehandel");
const populateReplies = require("../utils/populateReplies");




async function createBlog(req, res) {
    try {
        const creator = req.user.id;
        const { description, draft = false } = req.body;
        const image = req.file;

        if (!creator) {
            return res.status(400).json({
                success: false,
                message: "Kon hai be tu Teko permision nahi hai Account bana tu payle",
            });
        }

        if (!description && !image) {
            return res.status(400).json({
                success: false,
                message: "Kuch Data to Dal be Payle",
            });
        }

        let imageURL = "";
        let imageID = "";

        if (image) {
            try {
                const uploadedImage = await uploadImage(image.buffer);
                imageURL = uploadedImage.secure_url;
                imageID = uploadedImage.public_id;
            } catch (uploadErr) {
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed",
                    error: uploadErr.message,
                });
            }
        }

        const blog = await Blog.create({
            description,
            draft,
            image: imageURL,
            imageID,
            creator,
        })

        await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } })

        const populatedBlog = await Blog.findById(blog._id).populate({
            path: "creator",
            select: "name profilePhoto"
        });

        return res.status(201).json({
            success: true,
            message: "Blog uploaded successfully",
            blog: populatedBlog
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while uploading blog",
            error: error.message,
        });
    }
}

async function getBlogs(req, res) {
    try {
        const blogs = await Blog.find({ draft: false })
            .populate({
                path: "creator",
                select: "name profilePhoto",
                populate: {
                    path: "followers",
                    select: "name profilePhoto"
                }
            })
            .populate({
                path: "likes",
                select: "name"
            })
            .populate({
                path: "comments",
                populate: populateReplies()
            });

        return res.status(200).json({
            success: true,
            blogs: blogs,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error getting Blogs",
            error: error.message
        });
    }
}

async function getUserBlogs(req, res) {
    try {

        const creator = req.user.id;

        if (!creator) {
            return res.status(400).json({
                success: false,
                message: "User token Not Provided"
            })
        }

        const userBlogs = await Blog.find({ creator }).populate({
            path: "creator",
            select: "name"
        }).populate({
            path: "likes",
            select: "name"
        }).populate({
            path: "comments",
            populate: [
                {
                    path: "creator",     // comment's creator
                    select: "name profilePhoto"
                },

                {
                    path: "likes",     //likes of comment 
                    select: "name"
                }
            ],
            select: "comment"
        })

        return res.status(200).json({
            success: true,
            message: "Fetched user's blogs",
            blogs: userBlogs
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error fetching user blogs",
            error: error.message
        });
    }
}

async function deleteBlog(req, res) {

    try {

        const blogID = req.params.id;
        const userID = req.user.id

        const blog = await Blog.findById(blogID)

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        if (blog.creator.toString() !== userID) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this blog" });
        }

        await Blog.findByIdAndDelete(blogID);

        if (blog.imageID) {
            try {
                await deleteImage(blog.imageID);
            } catch (imgErr) {
                console.error("Cloudinary image deletion failed:", imgErr.message);
            }
        }

        await User.findByIdAndUpdate(userID, { $pull: { blogs: blogID } });

        return res.status(200).json({
            success: true,
            message: "blog deleted sucessfully",
        })


    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Error Deleting Blogs",
            error: error.message
        })
    }
}

async function updateBlog(req, res) {
    try {
        const blogID = req.params.id;
        const userID = req.user.id;
        const image = req.file;
        const { description, draft } = req.body;

        if (!userID) {
            return res.status(400).json({
                success: false,
                message: "Token not found",
            });
        }

        if (!description && typeof draft !== "boolean" && !image) {
            return res.status(400).json({
                success: false,
                message: "At least update one field",
            });
        }

        const blog = await Blog.findById(blogID);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        if (blog.creator.toString() !== userID) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this blog",
            });
        }

        let imageURL = blog.image;
        let imageID = blog.imageID;

        if (image) {
            try {
                if (imageID) {
                    await deleteImage(imageID);
                }

                const uploadedImage = await uploadImage(image.buffer);
                imageURL = uploadedImage.secure_url;
                imageID = uploadedImage.public_id;
            } catch (imgErr) {
                return res.status(500).json({
                    success: false,
                    message: "Image Upload Failed",
                    error: imgErr.message,
                });
            }
        }

        const updateData = {};
        if (description) updateData.description = description;
        if (typeof draft === "boolean") updateData.draft = draft;
        if (imageURL && imageID) {
            updateData.image = imageURL;
            updateData.imageID = imageID;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogID, updateData, { new: true });

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blogs: updatedBlog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating blog",
            error: error.message,
        });
    }
}

async function likeBlog(req, res) {
    try {

        const id = req.params.id;
        const userId = req.user.id;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(400).json({
                success: false,
                message: "All the feilds are mandatory, Please fill the data"
            })
        }

        if (blog.likes.includes(userId)) {
            await Blog.findByIdAndUpdate(id, { $pull: { likes: userId } })
            const updatedBlog = await Blog.findById(id);
            return res.status(200).json({
                success: true,
                message: "blog Unliked",
                updatedBlog
            })
        } else {
            await Blog.findByIdAndUpdate(id, { $push: { likes: userId } })
            const updatedBlog = await Blog.findById(id);
            return res.status(200).json({
                success: true,
                message: "blog liked",
                updatedBlog
            })
        }

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error gettings Blogs",
            error: error.message
        })
    }
}



module.exports = { createBlog, getBlogs, getUserBlogs, deleteBlog, updateBlog, likeBlog }


