require('dotenv').config()
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const port = process.env.PORT || 3000;
require("./db/conn");
const bcryptjs = require("bcryptjs");
const Register = require("./models/register");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");


const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");
app.use(express.static(static_path));
// console.log(path.join(__dirname,"../public"));

app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post("/register", async (req, res) => {
  try {
    // console.log(req.body.fullname);
    // res.send(req.body.fullname);
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    // console.log(req.body.name);
    // console.log(req.body.username);
    // console.log(req.body.email);
    // console.log(req.body.gender);
    // console.log(req.body.phone);
    // console.log(req.body.password);
    // console.log(req.body.confirmpassword);

    if (password === cpassword) {
      const employeeReg = new Register({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        gender: req.body.gender,
        password: req.body.password,
        cpassword: req.body.confirmpassword,
      });

      //hashing to protect password -- refer register.js

      //after getting the data from the form entered by the user and before saving it to the DB, we use hashing

      //generating token
      // console.log("the success part" + employeeReg);

      const token = await employeeReg.generateAuthToken();
      // console.log(token);

      // red.cookie(name,  value, [options]); // Syntax
      res.cookie("jwt_reg",token, {
        expires: new Date(Date.now()+ 60000),
        httpOnly: true
      });
      console.log(cookie);

      const registered = await employeeReg.save();
      res.status(201).render("index");
    } else {
      res.send("Password not matching");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", auth, (req, res) => {
  // console.log(`The token is: ${req.cookies.jwt_reg}`)
  res.render("secret");
});

app.get("/logout", auth, async(req,res)=>{
  try {

    //logout from a specific device (in case you are logged in from multiple devices)
    // req.user.tokens = req.user.tokens.filter((currElement)=>{
    //   return currElement.token !== req.token;
    //   //here currElement token is the token stored in the DB and req.token is the latest current token stored on the browser
    // })

    //logout from all devices
    req.user.tokens = []; //all the tokens (for all devices) will be deleted from the DB


    // logout directly by deleting cookies
    res.clearCookie("jwt_reg");
    console.log("Logout successfully");

    await req.user.save();
    res.render("login");
    
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
})

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // console.log(email);
    // console.log(password);

    const getUser = await Register.findOne({ email: email }); // the 'second' email is the 'email' entered by the user in login form and the 'first' email is the 'email' from the database.

    const isMatch = await bcryptjs.compare(password, getUser.password); // first pwd is the pwd entered by the user and the second is the pwd present im the database
    //isMatch returns true if pwd entered by the user is same as the pwd present in the DB

    const token = await getUser.generateAuthToken(); // 1 line of code for login JWT authentication
    // console.log(token);

    res.cookie("jwt_reg",token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true
    })


    //Note: user must the enter the 'email' in the login form from any email present in the database...else gives error
    // if(getUser!== null && getUser.password === password && getUser.email === email)
    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("Invalid login details");
    }
  } catch (error) {
    res.status(400).send("Invalid login details");
    console.log(error);
  }
});

const jwt_reg = require("jsonwebtoken");

const createToken = async () => {
  const token = await jwt_reg.sign(
    { id: "657359b6b3f8f061a8db402c" },
    "jdsfksjfbdbfskjdbfsdkjbfkjsdbfsdkjfbsdkfbsdkjbfksdbfksdjfb"
  );
  console.log(token);
  const userVer = await jwt_reg.verify(
    token,
    "jdsfksjfbdbfskjdbfsdkjbfkjsdbfsdkjfbsdkfbsdkjbfksdbfksdjfb"
  );
  // console.log(userVer);
};

createToken();

app.listen(port, () => {
  console.log(`listening to the port no. ${port}`);
});
