const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

async function dbConnector() {
    try {
        await mongoose.connect(process.env.DB_URL, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
    } catch (error) {
        console.log(error);
    }
}


module.exports = dbConnector





