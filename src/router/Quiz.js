const express = require("express");
const { body } = require("express-validator");
const verify = require("../config/token_validation");
const router = express.Router();
const {createQuiz, updateQuiz, deleteQuiz,getQuizByAccessCode,getAllQuiz, submitScore} = require("../controllers/Quiz");

// GET LIST
router.get("/",getAllQuiz)
// CREATE
router.post("/",verify,createQuiz)
// UPDATE
router.put("/:id",verify,updateQuiz)
// DELETE
router.delete("/:id",verify,deleteQuiz)

// GET FOR PLAY
router.get("/play",getQuizByAccessCode)
router.post("/score",submitScore)
module.exports = router;