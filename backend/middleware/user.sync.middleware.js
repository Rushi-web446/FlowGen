const User = require("../models/user");

const syncUser = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const auth0Id = req.auth.sub;
    const namespace = "https://text-to-learn-api/";

    const email =
      req.auth[`${namespace}email`] || req.auth.email;

    const name =
      req.auth[`${namespace}name`] ||
      req.auth.name ||
      (email ? email.split("@")[0] : "User");





    if (!email) {
      return res.status(400).json({
        message: "Email missing in token. Check Auth0 post-login action.",
      });
    }

    const user = await User.findOneAndUpdate(
      { auth0Id },
      {
        $setOnInsert: {
          auth0Id,
          email,
          name,
        },
        $set: {
          lastLogin: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    req.appUser = user;
    next();
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate email detected" });
    }

    return res.status(500).json({ message: "User sync failed" });
  }
};

module.exports = syncUser;
