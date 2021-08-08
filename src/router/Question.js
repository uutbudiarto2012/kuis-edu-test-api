const express = require('express');
const verify = require('../config/token_validation');
const router = express.Router()
const { createQuestion, updateQuestion, deleteQuestion } = require('../controllers/Question');

router.post("/:quiz_id?",verify, createQuestion)
router.put("/edit/:id?",verify, updateQuestion)
router.delete("/:id?",verify, deleteQuestion)

module.exports = router;