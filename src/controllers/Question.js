const { knex } = require("../config/db_connection");
const { validationResult } = require("express-validator");
const uniqid = require('uniqid');
const fs = require('fs');
const path = require("path");

exports.createQuestion = async(req,res)=>{
  const quizId = parseInt(req.params.quiz_id);
  try {
    const isQuizExist = await verifyAuthor(req.user,quizId)
    if(isQuizExist){

      const data = {
        quiz_id : isQuizExist.quiz_id,
        type : req.body.type,
        description : req.body.description,
        question : req.body.question,
        options : JSON.stringify(req.body.options),
        answer : req.body.answer,
        point : req.body.point,
        punishment : req.body.punishment,
      }
      const result = await knex('quiz_question').insert(data);
      if(result){
        res.status(201).json({
          message : "Question has been created!",
          data : data
        })
      }

    }else{
      res.status(404).json({
        message : "Quiz not found!"
      })
    }    
  } catch (err) {
    res.status(500).json({
      message : "Request Failed!",
      error : err
    })
  }
}
exports.updateQuestion = async(req,res)=>{
  const questionId = parseInt(req.params.id);
  try {
    const quiz = await knex('quiz_question').where('question_id',questionId)
    if(quiz){
      const data = {
        type : req.body.type,
        description : req.body.description,
        question : req.body.question,
        options : JSON.stringify(req.body.options),
        answer : req.body.answer,
        point : req.body.point,
        punishment : req.body.punishment,
      }
      const result = await knex('quiz_question').where('question_id',questionId).update(data)
      if(result){
        res.status(200).json({
          message : "Question has been updated!",
          data : data
        })
      }else{
        res.status(400).json({
          message : "Update question failed!",
        })
      }
    }
  } catch (err) {
    res.status(500).json({
      message : "Request Failed!",
      error : err
    })
  }
}
exports.deleteQuestion = async(req,res)=>{
  const questionId = parseInt(req.params.id);
  try {
    const result = await knex('quiz_question').where('question_id',questionId).del();
      if(result){
        res.status(200).json({
          message : "Question has been deleted!"
        })
      }else{
        res.status(400).json({
          message : "Failed delete question!"
        })
      }
  } catch (err) {
    res.status(500).json({
      message : "Request Failed!",
      error : err
    })
  }
}


const verifyAuthor = async (user,quizId)=>{
  const where = {
    quiz_id:quizId,
    author : user.id
  }
  const quiz = await knex('quiz_session').where(where)
  return quiz[0];
}