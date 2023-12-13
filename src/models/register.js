const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mernSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // required:true
  },
  confirmpassword: {
    type: String,
    // required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//generating tokens
mernSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    // console.log("The token part" + token);
    this.tokens = this.tokens.concat({ token: token }); // this line of code means that we are passing the value of 'token' generated just above, to the "tokens > token" field created in DB schema
    await this.save();// after we concat the 'token' value(or passing the generted 'token' value to the 'token' field in the schema) then call t he save() method so that the changes are saved to the DB
    return token; // if not written value of 'token' will be undefined
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

//converting password into hash
mernSchema.pre("save", async function (next) {
  //if only password field is changed/modified(i.e in the case of new registration or forgot password, we will use hashing)
  if (this.isModified("password")) {
    // console.log(`${this.password}`);
    this.password = await bcryptjs.hash(this.password, 10);
    this.confirmpassword = await bcryptjs.hash(this.password, 10);
    // console.log(`${this.password}`);
    // console.log(`${this.confirmpassword}`);

    // this.confirmpassword = undefined; // to hide the confirmpassword field in database
  }

  next();
});

const Register = new mongoose.model("Register", mernSchema);
module.exports = Register;
