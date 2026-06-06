const User = require("../models/user");

const syncUser = async (req, res, next) => {
  
  try {
    // Handle custom JWT tokens
    if (req.user && req.user.userId) {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.appUser = user;
      return next();
    }

    return res.status(401).json({ message: "Unauthorized: No valid user found" });
  } catch (error) {
    console.error("User sync error:", error);
    return res.status(500).json({ message: "User sync failed" });
  }
};

module.exports = syncUser;
