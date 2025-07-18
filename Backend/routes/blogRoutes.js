const express = require("express");
const route = express.Router();

const { createBlog, getBlogs, getUserBlogs, deleteBlog, updateBlog, likeBlog, } = require("../controllers/blogController");
const verifyUser = require("../middlewares/auth");
const upload = require("../utils/multer");


route.post("/blogs", verifyUser, upload.single("image"), createBlog)
route.get("/blogs", getBlogs)

route.get("/userBlogs", verifyUser, getUserBlogs)
route.delete("/blogs/:id", verifyUser, deleteBlog)

route.put("/blogs/:id", verifyUser, upload.single("image"), updateBlog)

route.post("/blogs/like/:id", verifyUser, likeBlog)


module.exports = route

