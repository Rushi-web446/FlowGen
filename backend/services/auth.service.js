const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { addUser, findByEmail, findByAuth0Id } = require("../repository/user.repository.js");

const SignupService = async ({ name, email, sub }) => {
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



  return {
    user: {
      id: newUser._id,
      Auth0Id:newUser.Auth0Id,
      email: newUser.email,
      name: newUser.name,
    },
  };
};

const LoginService = async ({ email, sub }) => {
  const user = await findByAuth0Id(sub);
  if (!user) throw new Error("Invalid credential"); // think about the message I am sending


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
