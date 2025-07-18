const JWT = require("jsonwebtoken");
const dotenv = require("dotenv")
dotenv.config()

async function genrateJwtToken(payload) {
    let token = JWT.sign(payload, process.env.JWT_TOKEN)
    return token
}



async function verifytoken(token) {
    try {
        let data = await JWT.verify(token, process.env.JWT_TOKEN)
        return data
    } catch (error) {
        return false 
    }
}

module.exports = { genrateJwtToken  , verifytoken}