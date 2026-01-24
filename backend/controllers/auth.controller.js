const { SignupService, LoginService } = require("../services/auth.service");

const signup = async (req, res) => {
  console.log("\n\n\n\n  --> reaching :  backend/controllers/auth.controller.js . \n\n\n");
  try {
    const data = await SignupService(req.body);
    return res.status(201).json({
      message: "Signup successful",
      data,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  console.log("\n\n\n\n  --> reaching :  backend/controllers/auth.controller.js . \n\n\n");
  try {
    const data = await LoginService(req.body);
    return res.status(200).json({
      message: "Login successful",
      data,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { signup, login };
