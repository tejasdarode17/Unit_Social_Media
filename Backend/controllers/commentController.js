const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const populateReplies = require("../utils/populateReplies")


async function commentBlog(req, res) {

    try {
        const blogID = req.params.id;
        const userID = req.user.id;

        const { comment } = req.body

        const blog = await Blog.findById(blogID)

        if (!comment || !blog) {
            return res.status(400).json({
                success: false,
                message: "All the feilds are mandatory, Please fill the data"
            })
        }

        const newComment = await Comment.create({
            comment: comment,
            blog: blogID,
            creator: userID
        })

        await Blog.findByIdAndUpdate(blogID, { $push: { comments: newComment._id } })

        const updatedBlog = await Blog.findById(blogID)
            .populate({
                path: "creator",
                select: "name profilePhoto",
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
            message: "comment posted sucessfully",
            updatedBlog
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error gettings Blogs",
            error: error.message
        })
    }

}

async function deleteComment(req, res) {

    try {

        const commentID = req.params.id;
        const userID = req.user.id;

        const comment = await Comment.findById(commentID);
        const blog = await Blog.findById(comment.blog)

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        const isCommentCreator = comment.creator.toString() === userID;
        const isBlogOwner = blog.creator.toString() === userID

        if (!isCommentCreator && !isBlogOwner) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment",
            });
        }


        await Blog.findByIdAndUpdate(comment.blog, {
            $pull: { comments: comment._id },
        });


        await Comment.findByIdAndDelete(commentID);



        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error gettings Blogs",
            error: error.message
        })
    }
}

async function editComment(req, res) {

    try {
        const commentID = req.params.id;
        const userID = req.user.id;
        const { comment } = req.body

        const existingComment = await Comment.findById(commentID);

        if ((!existingComment)) {
            return res.status(404).json({
                success: false,
                message: "Blog or comment not found",
            });
        }

        if (existingComment.creator.toString() !== userID) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this comment",
            });
        }

        const updatedComment = await Comment.findByIdAndUpdate(commentID, { comment }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            comment: updatedComment
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error gettings Blogs",
            error: error.message
        })
    }
}

async function likeComment(req, res) {

    try {
        const commentID = req.params.id;
        const userID = req.user.id;

        const comment = await Comment.findById(commentID);

        if ((!comment)) {
            return res.status(404).json({
                success: false,
                message: "comment not found",
            });
        }

        if (comment.likes.includes(userID)) {
            await Comment.findByIdAndUpdate(commentID, { $pull: { likes: userID } })
            const updatedComment = await Comment.findById(commentID)
                .populate({
                    path: "creator",
                    select: "name"
                }).populate({
                    path: "likes",
                    select: "name"
                })

            return res.status(200).json({
                success: true,
                message: "Comment Unliked",
                comment: updatedComment
            })
        } else {
            await Comment.findByIdAndUpdate(commentID, { $push: { likes: userID } })
            const updatedComment = await Comment.findById(commentID)
                .populate({
                    path: "creator",
                    select: "name"
                }).populate({
                    path: "likes",
                    select: "name"
                })

            return res.status(200).json({
                success: true,
                message: "Comment liked",
                comment: updatedComment
            })
        }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error gettings Comment",
            error: error.message
        })
    }
}

async function replayComment(req, res) {
    try {
        const { replay } = req.body
        const userID = req.user.id;

        const { parentCommentID, blogID } = req.params

        const comment = await Comment.findById(parentCommentID);
        const blog = Blog.findById(blogID);


        if (!userID) {
            return res.status(400).json({
                success: false,
                message: "userID is not Found"
            })
        }

        if (!comment || !blog) {
            return res.status(400).json({
                success: false,
                message: "commentID or blogId is not found"
            })
        }

        const newReplay = await Comment.create({
            comment: replay,
            blog: blogID,
            creator: userID,
            parentComment: parentCommentID
        })

        await Comment.findByIdAndUpdate(parentCommentID, { $push: { replies: newReplay._id } })

        const updatedBlog = await Blog.findById(blogID)
            .populate({
                path: "creator",
                select: "name profilePhoto",
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
            message: "comment posted sucessfully",
            updatedBlog
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error gettings Comment",
            error: error.message
        })
    }

}



module.exports = { commentBlog, deleteComment, editComment, likeComment, replayComment }