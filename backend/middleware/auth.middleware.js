
const jwt = require("jsonwebtoken");

const checkJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Try to verify as local JWT first
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    return next();
  } catch (err) {
    // If local JWT fails, you could add Auth0 verification here in future
    return res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = checkJwt;