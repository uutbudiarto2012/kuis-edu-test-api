const express = require("express");
const app = express();

const multer = require("multer");
const path = require("path");

require("dotenv").config();
const port = process.env.PORT;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
    
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return false;
  }
};

app.use(express.json());
app.use('/public/images',express.static(path.join(__dirname,'public/images')))
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'))

const authRouter = require("./src/router/Auth");
const userRouter = require("./src/router/User");
const questionTypeRouter = require('./src/router/Questiontype')
const quizRouter = require('./src/router/Quiz')
const questionRouter = require('./src/router/Question')

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Method", "GET,PUT,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
// QUESTION TYPE
app.use("/api/v1/question-type", questionTypeRouter);
// QUIZ
app.use("/api/v1/quiz", quizRouter);
// QUESTION
app.use("/api/v1/question", questionRouter);


app.listen(port, (req, res) => {
  console.log("SERVER RUNNING ON PORT = " + port);
});
