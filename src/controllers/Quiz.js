const { knex } = require("../config/db_connection");
const { validationResult } = require("express-validator");
const uniqid = require("uniqid");
const fs = require("fs");
const path = require("path");
const nodemailer = require('nodemailer')

require('dotenv').config()

exports.getAllQuiz = async(req,res) =>{
  try {
    const quiz = await knex('quiz_session');
    if(!quiz) return res.status(404).json({
      message : "Quiz not found!",
      data : []
    })
    res.status(200).json({
      message : "Get quiz success!",
      data : quiz
    })
  } catch (err) {
    res.status(500).json({
      message : "Request failed!",
      error : err
    })
  }
}
exports.createQuiz = async (req, res) => {
  let media;
  if (req.file) media = req.file.path;
  const access_code = uniqid();
  const title = req.body.title;
  const description = req.body.description;
  const type_session_id = req.body.type_id;
  const author = req.user.id;
  try {
    const data = {
      access_code,
      title,
      description,
      media,
      type_session_id,
      author,
    };
    const result = await knex("quiz_session").insert(data);
    if (result) {
      const quiz = await knex("quiz_session").where("access_code", access_code);
      res.status(201).json({
        message: "New quiz session created!",
        data: quiz,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Request failed!",
      error: error,
    });
  }
};
exports.updateQuiz = async (req, res) => {
  const paramId = parseInt(req.params.id);
  const userId = req.user.id;
  let newMedia;
  try {
    const quiz = await knex("quiz_session").where("quiz_id", paramId);
    if (quiz) {
      // CEK APAKAH USER ADALAH AUTHOR KUIS
      if (userId !== quiz[0].author)
        return res.status(403).json({ message: "Access forbidden!" });
      // CEK APAKAH ADA IMAGE
      if (req.file) {
        removeImage(quiz[0].media);
        newMedia = req.file.path;
      }
      const data = {
        title: req.body.title,
        description: req.body.description,
        type_session_id: req.body.type_id,
        media: newMedia,
        updated_at: new Date(),
      };
      const result = await knex("quiz_session")
        .where("quiz_id", paramId)
        .update(data);
      if (result) {
        const quizUpdated = await knex("quiz_session").where(
          "quiz_id",
          paramId
        );
        res.status(200).json({
          message: "Quiz has been updated!",
          data: quizUpdated[0],
        });
      }
    } else {
      res.status(404).json({
        message: "Quiz not found!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Request failed!",
      error: error,
    });
  }
};
exports.deleteQuiz = async (req, res) => {
  const paramId = parseInt(req.params.id);
  const userId = req.user.id;
  const roleId = req.user.role;
  try {
    const quiz = await knex("quiz_session").where("quiz_id", paramId);
    if (quiz) {
      // CEK APAKAH USER ADALAH AUTHOR KUIS
      if (userId !== quiz[0].author || roleId !== 1)
        return res.status(403).json({ message: "Access forbidden!" });
      // CEK APAKAH ADA IMAGE
      if (quiz[0].media) {
        removeImage(quiz[0].media);
      }
      const result = await knex("quiz_session").where("quiz_id", paramId).del();
      if (result) {
        res.status(200).json({
          message: "Quiz has been deleted!",
        });
      }
    } else {
      res.status(404).json({
        message: "Quiz not found!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Request failed!",
      error: error,
    });
  }
};
const removeImage = (filePath) => {
  filePath = path.join(__dirname, "../..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

// GET FOR PLAY
exports.getQuizByAccessCode = async (req, res) => {
  const { access_code, email,name } = req.query;
  if (!access_code && !email && !name)
    return res.status(400).json({
      message: "Please provide access code and email!",
    });
  try {
    const quiz = await knex("quiz_session").where("access_code", access_code);
    if (quiz[0]) {
      // JUKA KUIS ADA MAKA DAFTARKAN EMAIL
      const dataPalyer = {
        quiz_code: quiz[0].access_code,
        email: email,
        name: name,
        score: 0,
      };

      let isPlayer = true;
      const checkPlayer = await knex('players').where({email:email,quiz_code:access_code});
      if(!checkPlayer[0]){
        const createPlayer = await knex("players").insert(dataPalyer);
        if(createPlayer){
          isPlayer = true;
        }else{
          isPlayer = false;
        }
      }
      if (isPlayer) {
        const quizQuestion = await getQuizQuestion(quiz[0]);
        res.status(200).json({
          message: "Get quiz success!",
          peserta: { email,name },
          quiz: {
            title: quiz[0].title,
            description: quiz[0].description,
          },
          questions: quizQuestion,
        });
      } else {
        res.status(400).json({
          message: "Create palyer failed!",
        });
      }
    } else {
      res.status(404).json({
        message: "Quiz not found or closed!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Request failed!",
      error: error,
    });
  }
};
const getQuizQuestion = async (quiz) => {
  try {
    let q=[];
    const question = await knex("quiz_question")
      .where("quiz_id", quiz.quiz_id)
      .select("question", "options", "answer", "point", "punishment");
    question.map(item=>{
      const newItem = {
        question : item.question,
        option : JSON.parse(item.options),
        answer : item.answer,
        point : item.point,
        punishment : item.punishment
      } 
      q.push(newItem);
    })
    return q;
  } catch (error) {
    console.log(error)
  }
};

// SUBMIT SCRORE
exports.submitScore = async (req,res) => {
  const  access_code  = req.body.access_code;
  const  score        = req.body.score;
  const  email        = req.body.email;
  const time_submit   = new Date()
  try {
    const submitScore = await knex('players').where({quiz_code:access_code,email:email}).update({score,time_submit})
    if(submitScore){
      const result = await knex('players').where({email:email,quiz_code:access_code})
      res.status(200).json({
        message : "Submit score success!",
        data : result[0]
      })
      sendEmailScore(result[0])
    }else{
      res.status(400).json({
        message: "Submit score failed!"
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Request failed!",
      error: err,
    });
  }
}
const sendEmailScore = (data)=>{
  const transporter = nodemailer.createTransport({
    service : process.env.MAIL_SERVICE,
    auth :{
      user : process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })
  const htmlMessage = `
  <div>
    <h1>Hai, ${data.name}</h1>
    <h3>Selamat, Anda telah menyelesaikan tantangan Kuis Edu.</h3>
    <h3 style="margin-top:20px; text-align:center">SCORE ANDA</h3>
    <div style="margin:auto;">
    <h1 style="color:#FFF;background-color:#ff0000;border-radius:5px;text-align:center;padding:10px;">${data.score}</h1>
    </div>
    </div>
  `;
    const mailOptions = {
    from: "HiKids Kuis Edu",
    to: data.email,
    subject: "SCORE KUIS EDU",
    html : htmlMessage
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) throw err;
    console.log("Email sent: " + info.response);
  });
};


