const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { addUser, findByEmail, findByAuth0Id } = require("../repository/user.repository.js");

const SignupService = async ({ name, email, password, sub }) => {
  // Check by email for email/password auth, or by Auth0Id for Auth0 auth
  let isExist;
  if (sub) {
    isExist = await findByAuth0Id(sub);
  } else if (email) {
    isExist = await findByEmail(email);
  }

  if (isExist) {
    throw new Error("User already exist");
  }

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  let newUser = {
    name: name,
    email: email,
    courses: [],
  };

  // If password is provided, hash it (email/password auth)
  if (password) {
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
  }

  // If Auth0 ID is provided, store it
  if (sub) {
    newUser.auth0Id = sub;
  }

  newUser = await addUser(newUser);

  return {
    user: {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    },
  };
};



const LoginService = async ({ email, password, sub }) => {
  let user;

  // If Auth0 login
  if (sub) {
    user = await findByAuth0Id(sub);
    if (!user) throw new Error("Invalid credential");
  } 
  // If email/password login
  else if (email && password) {
    user = await findByEmail(email);
    if (!user) throw new Error("Invalid credential");

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credential");
  } else {
    throw new Error("Email and password are required");
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  };
};

module.exports = { SignupService, LoginService };
