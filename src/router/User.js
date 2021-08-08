const express = require("express");
const { body } = require("express-validator");
const verify = require("../config/token_validation");
const router = express.Router();
const { getUser, changePassword, updateProfile, updateImage } = require("../controllers/User");

// GET USER
router.get("/:id?", verify, getUser);
// CHANGE PASSWORD
router.post(
  "/password/:id",
  verify,
  [
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("new password must be at least 6 chars long!"),
  ],
  changePassword
);
// UPDATE PROFILE
router.put("/:id",verify,updateProfile)
// UPDATE IMAGE
router.post("/image/:id",verify,updateImage)
module.exports = router;
