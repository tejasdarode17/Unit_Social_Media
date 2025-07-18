const User = require("../models/userSchema")
const bcrypt = require("bcrypt");
const { genrateJwtToken, verifytoken } = require("../utils/genrateToken");
const { uploadImage, deleteImage } = require("../utils/imagehandel");
const sendEmail = require("../utils/transporter");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const axios = require("axios")
const dotenv = require("dotenv")
dotenv.config()


admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.FIREBASE_TYPE,
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": process.env.FIREBASE_AUTH_URI,
        "token_uri": process.env.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
        "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN
    }
    )
});

async function signUp(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Something is missing"
            });
        }

        const existingUSer = await User.findOne({ email })

        if (existingUSer) {
            return res.status(400).json({
                success: false,
                message: "User Already Exist with this email"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)


        const payload = {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            isVerified: false,
        }

        const token = await genrateJwtToken(payload)


        const link = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        await sendEmail(email, "Verify your Email", `<h3>Click here to verify:</h3><a href="${link}">${link}</a>`)


        return res.status(200).json({
            success: true,
            message: "Verification email sent. Please verify your email to continue.",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error During Sign up",
            error: error.message
        })
    }

}

async function verifyEmail(req, res) {
    const { token } = req.params

    try {

        const userData = await verifytoken(token)

        if (!userData) {
            return res.status(400).json({ success: false, message: "token not found" });
        }
        const { name, email, password } = userData

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            isVerified: true
        })

        const authToken = await genrateJwtToken({
            id: user._id,
            email: user.email
        });

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: user,
            token: authToken
        });

    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
}

async function googleAuth(req, res) {

    try {

        const { idToken } = req.body

        const response = await getAuth().verifyIdToken(idToken);

        const { name, email, picture, } = response

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            const authToken = await genrateJwtToken({
                id: existingUser._id,
                email: existingUser.email,
            });

            return res.status(200).json({
                success: true,
                message: "User logged in with Google",
                user: existingUser,
                token: authToken,
            });
        }


        let uploadedImage;
        try {
            const imageBuffer = (await axios.get(picture, { responseType: "arraybuffer" })).data;
            uploadedImage = await uploadImage(imageBuffer);
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "Google profile image upload failed",
                error: err.message,
            });
        }

        const newUser = await User.create({
            name,
            email,
            profilePhoto: uploadedImage.secure_url,
            profilePhotoID: uploadedImage.public_id,
            googleVerified: true,
        });

        const authToken = await genrateJwtToken({
            id: newUser._id,
            email: newUser.email,
        });


        res.status(200).json({
            success: true,
            message: "user Registred With Google",
            user: newUser,
            token: authToken
        });


    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
}

async function login(req, res) {
    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).send("something is missing")
        }

        const existingUser = await User.findOne({ email })
            .populate({ path: "blogs" })
            .populate({ path: "followers" })
            .populate({ path: "following" });

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User not exist with this Email",
            })
        }

        if (existingUser.googleVerified) {
            return res.status(400).json({
                success: false,
                message: "This account is registered via Google. Please use Google login.",
            });
        }

        if (!existingUser.password) {
            return res.status(400).json({
                success: false,
                message: "Password not set for this user. Try Google login.",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Password",
            })
        }

        const token = await genrateJwtToken({
            email: existingUser.email,
            id: existingUser._id
        })

        return res.status(200).json({
            success: true,
            message: "User Login Sucessfully",
            user: existingUser,
            token
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something Went wrong on the Server",
            error: error.message
        });
    }

}

async function getUserByID(req, res) {
    try {
        const id = req.params.id
        const user = await User.findById(id)
            .populate(
                {
                    path: "blogs",
                    populate: [
                        {
                            path: "creator",
                            select: "name profilePhoto"
                        },
                        {
                            path: "comments",
                            populate: [
                                {
                                    path: "creator",
                                    select: "name profilePhoto"
                                }
                            ]
                        },
                        {
                            path: "likes",
                            select: "name"
                        }
                    ],
                },
            ).populate(
                {
                    path: "followers",
                    select: "name"
                }
            )

        if (!user) {
            return res.status(400).send("User not Found")
        }

        return res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        return res.status(200).json({
            success: false,
            message: "Something Went wrong on Server",
            error: error.message
        })
    }
}

async function getUserByName(req, res) {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).send("Params not sent");
        }

        const users = await User.find({ name: new RegExp(name, 'i') });

        if (users.length === 0) {
            return res.status(404).send({
                message: `Not any Result for ${name}`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Success",
            users,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong on the server",
            error: error.message,
        });
    }
}

async function deleteUser(req, res) {
    try {
        const id = req.params.id
        const userID = req.user.id

        if (!userID) {
            return res.send("user token mismatch")
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.send("user not found")
        }

        return res.status(200).json({
            success: true,
            message: "User Sucessfully deleted",
            deletedUser
        })

    } catch (error) {
        return res.status(200).json({
            success: false,
            message: "User Not Found",
            error: error.message
        })
    }
}

async function updateUser(req, res) {
    try {
        const userID = req.params.id
        const { name, bio } = req.body
        const image = req.file
        const userIdbyJwt = req.user.id

        if (userIdbyJwt !== userID) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Token does not match user ID",
            });
        }

        const user = await User.findById(userID)

        let imageID = user.profilePhotoID
        let imageURL = user.profilePhoto

        if (image) {
            try {
                if (imageID) await deleteImage(imageID);
                const uploadedImage = await uploadImage(image.buffer);
                imageURL = uploadedImage.secure_url;
                imageID = uploadedImage.public_id;
            } catch (uploadErr) {
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed",
                    error: uploadErr.message,
                })
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (bio) updateData.bio = bio;
        updateData.profilePhoto = imageURL;
        updateData.profilePhotoID = imageID;

        const updatedUser = await User.findByIdAndUpdate(userID, updateData, { new: true });



        return res.status(200).json({
            success: true,
            message: "User Sucessfully updated",
            updatedUser
        })

    } catch (error) {
        return res.status(200).json({
            success: false,
            message: "User Not Found",
            error: error.message
        })
    }
}

async function follow(req, res) {

    try {
        const userToFollowID = req.params.id
        const userID = req.user.id


        const userToFollow = await User.findById(userToFollowID);
        const user = await User.findById(userID)


        if (!user) {
            res.status(400).json({
                success: false,
                message: "your token is expired",
            })
        }
        if (!userToFollow) {
            res.status(400).json({
                success: false,
                message: "The user you trying to follow might not exist",
            })
        }

        if (userToFollow.followers.includes(userID)) {
            await User.findByIdAndUpdate(userToFollowID, { $pull: { followers: userID } })
            await User.findByIdAndUpdate(userID, { $pull: { following: userToFollowID } })

            const updatedUser = await User.findById(userID)
                .populate({
                    path: "followers",
                    select: "name ,profilePhoto"
                }).populate({
                    path: "following",
                    select: "name ,profilePhoto"
                })

            return res.status(200).json({
                success: true,
                message: "you Unfollowed",
                updatedUser
            })

        } else {
            await User.findByIdAndUpdate(userToFollowID, { $push: { followers: userID } })
            await User.findByIdAndUpdate(userID, { $push: { following: userToFollowID } })

            const updatedUser = await User.findById(userID)
                .populate({
                    path: "followers",
                    select: "name ,profilePhoto"
                }).populate({
                    path: "following",
                    select: "name ,profilePhoto"
                })

            return res.status(200).json({
                success: true,
                message: "you followed",
                updatedUser
            })
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error while following",
            error: error.message
        })
    }
}




module.exports = { signUp, login, getUserByID, deleteUser, updateUser, verifyEmail, googleAuth, follow, getUserByName }
