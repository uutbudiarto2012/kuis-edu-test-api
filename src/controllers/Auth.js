const { knex } = require("../config/db_connection");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// REGISTRATION
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  const username = req.body.username;
  const email = req.body.email;
  const passwordText = req.body.password;
  const display_name = req.body.display_name;
  const profile_picture       = "public/images/default_user_avatar.png";
  if (!errors.isEmpty())
    return res
      .status(400)
      .json({ message: "Bad Request!", error: errors.array() });
  //GENERATE HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(passwordText, salt);

  const data = { username, email, password, display_name,profile_picture };
  try {
    const result = await knex("users").insert(data);
    if (result) {
      res.status(201).json({
        message: "Registration success!",
        data: data,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Request failed!",
      error: error,
    });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  const { username } = req.body;
  if (!errors.isEmpty())
    return res
      .status(400)
      .json({ message: "Bad request!", error: errors.array() });
  try {
    const user = await knex("users")
      .where("username", username)
      .orWhere("email", username);
    if (!user[0]) return res.status(404).json({ message: "User not found!" });
    if (user[0].status === 0)
      return res.status(403).json({ message: "User inactive!" });

    // VALIDATE PASSWORD
    const validPassword = await bcrypt.compare(
      req.body.password,
      user[0].password
    );
    if (!validPassword)
      return res.status(403).json({ message: "wrong username or password!" });

    // GENERATE TOKEN
    const accessToken = jwt.sign(
      { id: user[0].user_id, email: user[0].email, role: user[0].role_id },
      process.env.KEY_TOKEN,
      { expiresIn: "5d" }
    );

    let expireToken;
    jwt.verify(accessToken, process.env.KEY_TOKEN, (err, time) => {
      expireToken = time.exp;
    });

    const { password, ...info } = user[0];
    res.status(200).json({
      message: "Login success!",
      data: info,
      accessToken: {
        token: accessToken,
        type: "Bearer",
        exp: expireToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Request failed!",
      error: error,
    });
  }
};

// EMAIL
// exports.resetPassword = async (req, res) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "uutbudhics1@gmail.com",
//       pass: "2012470127",
//     },
//   });

//   const mailOptions = {
//     from: "HiKids Kuis Edu",
//     to: req.body.email,
//     subject: "Sending Email using Nodejs",
//     text: "That was easy!",
//   };
//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) throw err;
//     console.log("Email sent: " + info.response);
//   });
// };
