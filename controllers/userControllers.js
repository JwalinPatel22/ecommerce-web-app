const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//generating jwt token
const generateAuthToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, "JWT_SECRET_#123", {
    expiresIn: "1h",
  });
};

const registerUser = async function (req, res) {
  const { fname, lname, email, password } = req.body;

  existingUser = await User.findOne({ email: email });
  if (existingUser) {
    res.status(400).send("User already exists");
  } else {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      const newUser = new User({
        firstname: fname,
        lastname: lname,
        email: email,
        password: hash,
      });
      try {
        newUser.save();
        const token = generateAuthToken(newUser);
        res
          .header("x-auth-token", token)
          .json({ msg: "Registeration successful" });
      } catch (error) {
        console.log("Cannot register user", error);
        res.status(500);
      }
    });
  }
};

const loginUser = async function (req, res) {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return res.status(400).json({ msg: "User not registered" });
    }

    //comparing passoword
    const validPassword = await bcrypt.compare(password, validUser.password);
    if (!validPassword) {
      return res.status(400).jspn({ msg: "Incorrect password" });
    }

    //generating jwt token
    const token = generateAuthToken(validUser);
    res.header("x-auth-token", token).json({ msg: "Login successful" });
  } catch (error) {
    console.log("Login Failed", error);
    res.status(500);
  }
};

const getAllUsers = async function (req, res) {
  try {
    const allUsers = await User.find({});
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Error getting users" });
  }
};

module.exports = { registerUser, loginUser, getAllUsers };
