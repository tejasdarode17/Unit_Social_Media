const express = require("express");
const route = express.Router()

const { commentBlog, deleteComment, editComment, likeComment , replayComment} = require("../controllers/commentController");
const verifyUser = require("../middlewares/auth");


route.post("/blogs/comment/:id", verifyUser, commentBlog)
route.delete("/blogs/deleteComment/:id", verifyUser, deleteComment)
route.put("/blogs/editComment/:id", verifyUser, editComment)
route.post("/blogs/likeComment/:id", verifyUser, likeComment)




route.post("/blogs/comment/:parentCommentID/:blogID", verifyUser, replayComment)

module.exports = route