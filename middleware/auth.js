const jwt = require("jsonwebtoken");
const Register = require("../src/models/register");

const auth = async(req,res,next) => {
   try {
    const token = req.cookies.jwt_reg;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifyUser);

    const user = await Register.findOne({_id:verifyUser._id});
    console.log(user);
    console.log(user.name);

    req.token = token;
    req.user = user;   

    next();
   } catch (error) {
    res.status(401).send(error);
    console.log(error);
   }
}

module.exports = auth;