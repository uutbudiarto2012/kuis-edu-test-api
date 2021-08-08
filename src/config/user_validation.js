const {knex} = require('./db_connection')

async function userValidation(req,res,next){
    const {email,username} = req.body;
    const emailExist = await knex('users').where('email',email)
    const usernameExist = await knex('users').where('username',username)
    if(emailExist[0]){
        res.status(400).json({message:"email has been used!"})
    }else if (usernameExist[0]) {
        res.status(400).json({message:"username has been used!"})
    } else {
        next()
    }
}

module.exports = userValidation;