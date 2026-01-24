// const express = require("express");
// const { signup, login } = require("../controllers/auth.controller.js");
// const { checkJwt } = require("../middleware/auth.middleware.js");
// const { findByAuth0Id } = require("../repository/user.repository.js");
// const router = express.Router();

// router.post("/signup", signup);
// router.post("/login", login);

// router.get("/user", checkJwt, async (req, res) => {
//   const { sub, email, name } = req.user;

//   let user = await findByAuth0Id(sub);

//   if (user) {
//     return await axios("http://localhost:3001/auth/signup", {
//         user
//     });
//   } else {
//     return await axios("http://localhost:3001/auth/login", {

//     });
//   }

//   res.json(user);
// });

// module.exports = router;
