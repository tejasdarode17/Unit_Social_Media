const JWT = require("jsonwebtoken");

async function verifyUser(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "token not provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = JWT.verify(token, process.env.JWT_TOKEN);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Token", error: error.message });
    }

}

module.exports = verifyUser
