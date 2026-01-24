const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { addUser, findByEmail, findByAuth0Id } = require("../repository/user.repository.js");

const SignupService = async ({ name, email, sub }) => {
  console.log("\n\n\n\n  --> reaching :  backend/services/auth.service.js . \n\n\n");
  const isExist = await findByAuth0Id(sub);

  if (isExist) {
    throw new Error("User already exist");
  }

  let newUser = {
    name: name,
    email: email,
    auth0Id: sub,
    courses: [],
  };
  newUser = await addUser(newUser);

  // const token = jwt.sign(
  //   { id: newUser._id, email: newUser.email },
  //   process.env.JWT_SECRET,
  //   { expiresIn: "5d" }
  // );

  return {
    user: {
      id: newUser._id,
      Auth0Id:newUser.Auth0Id,
      email: newUser.email,
      name: newUser.name,
    },
    // token,
  };
};

const LoginService = async ({ email, sub }) => {
  console.log("\n\n\n\n  --> reaching :  backend/services/auth.service.js . \n\n\n");
  const user = await findByAuth0Id(sub);
  if (!user) throw new Error("Invalid credential"); // think about the message I am sending


  // const token = jwt.sign(
  //   { id: user._id, email: user.email },
  //   process.env.JWT_SECRET,
  //   { expiresIn: "5d" }
  // );

  return {
    user: {
      id: user._id,
      Auth0Id:newUser.Auth0Id,
      email: user.email,
      name: user.name,
    },
    token,
  };
};

module.exports = { SignupService, LoginService };
