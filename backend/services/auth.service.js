const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { addUser, findByEmail } = require("../repository/user.repository.js");

const SignupService = async ({ name, email, password }) => {
  // Validate required fields
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  // Check if user already exists
  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = await addUser({
    name,
    email,
    password: hashedPassword,
    courses: [],
  });

  // Generate JWT token
  const token = jwt.sign(
    { userId: newUser._id, email: newUser.email },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    },
    token,
  };
};

const LoginService = async ({ email, password }) => {
  // Validate required fields
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find user by email
  const user = await findByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user has password (in case they're old Auth0 users without password)
  if (!user.password) {
    throw new Error("This account uses Auth0 authentication. Please use Auth0 to login.");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    env.JWT_SECRET,
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
