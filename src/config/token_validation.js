const jwt = require('jsonwebtoken')
function verify(req,res,next) {
  const authHeader = req.headers.token;
  if(authHeader){
    const type = authHeader.split(" ")[0];
    const token = authHeader.split(" ")[1];
    if(!type || type !== 'Bearer') return res.status(403).json("Token is not valid!");
    jwt.verify(token,process.env.KEY_TOKEN,(err,user)=>{
      if(err) res.status(403).json("Token is not valid!")
      if((new Date().getTime()) > user.exp * 1000 ){
          return res.status(403).json({message:"Token Expired!",status:"expired"})
      }
      req.user = user;
      next();
  })
  }else{
    res.status(401).json("You are not authenticated!")
  }
}
module.exports = verify;
