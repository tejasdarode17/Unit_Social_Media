const express = require("express");
const route = express.Router();

const { signUp, login, getUserByID, deleteUser, updateUser, verifyEmail, googleAuth, follow, getUserByName } = require("../controllers/userController");
const verifyUser = require("../middlewares/auth");
const upload = require("../utils/multer");


route.post("/signup", signUp)

route.post("/login", login)

route.get("/verify-email/:token", verifyEmail);

route.post("/google-auth", googleAuth);

route.put("/users/:id", upload.single("profilePhoto"), verifyUser, updateUser)

route.post("/users/follow/:id", verifyUser, follow)

route.get("/users/:id", getUserByID)

route.get("/searchuser/:name", getUserByName)  //if we would have use query then no need to se this :name variable 


//not working 
route.delete("/users/:id", verifyUser, deleteUser)



module.exports = route  