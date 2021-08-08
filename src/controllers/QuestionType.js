const { knex } = require("../config/db_connection");
const { validationResult } = require("express-validator");

exports.createType = async (req,res)=>{
  if(req.user.role === 1 ){
    const type = req.body.type;
    try {
      const result = await knex('quiz_question_type').insert({type})
      if(result){
        res.status(201).json({
          message : "Create type success!",
          data : {
            type
          }
        })
      }
    } catch (err) {
      res.status(500).json({
        message : "Request failed!",
        error : err
      })
    }
  }else{
    res.status(403).json({
      message : "Account unauthorized!"
    })
  }
}

exports.getType = async (req,res)=>{
  try {
      const result = await knex('quiz_question_type')
      return res.status(200).json({
        message : "Get type success!",
        data : result
      })
  } catch (err) {
    res.status(500).json({
      message : "Request failed!",
      error : err
    })
  }
}