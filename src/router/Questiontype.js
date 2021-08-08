const express = require("express");
const { body } = require("express-validator");
const verify = require("../config/token_validation");
const router = express.Router();

const { createType, getType } = require("../controllers/QuestionType");

// CREATE
router.post("/",verify,createType)
// CREATE
router.get("/",getType)

module.exports = router;