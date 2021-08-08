const express   = require('express')
const router    = express.Router();
const { body } = require("express-validator");
const userValidation = require('../config/user_validation');

const {createUser, loginUser} = require('../controllers/Auth')

router.post("/signup",userValidation,[
    body("username").isLength({min:5}).withMessage("username must be at least 5 chars long!"),
    body("email").isEmail().withMessage("email is invalid!"),
    body("password").isLength({min:6}).withMessage("password must be at least 6 chars long!"),
    body("display_name").isLength({min:5}).withMessage("display_name must be at least 5 chars long!"),
],createUser)
router.post("/signin",[
    body("username").isLength({min: 1}).withMessage("username is required!"),
    body("password").isLength({min: 1}).withMessage("password is required!"),
],loginUser)

module.exports = router;