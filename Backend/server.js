const express = require("express");
const app = express()
const cors = require("cors");
const dbConnector = require("./config/dbConnect")
const userRouter = require("./routes/userRoutes")
const blogRouter = require("./routes/blogRoutes")
const commentRouter = require("./routes/commentRoutes");
const cloudinaryConfig = require("./config/cloudinary");
const dotenv = require("dotenv")
dotenv.config()


const PORT = process.env.PORT || 5000

const allowedOrigins = [
  "http://localhost:5173",
  "https://unit-frontend-psi.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRouter);
app.use("/api/v1", blogRouter);
app.use("/api/v1", commentRouter);


app.listen(PORT, () => {
  dbConnector();
  cloudinaryConfig()
  console.log("Running");
})





