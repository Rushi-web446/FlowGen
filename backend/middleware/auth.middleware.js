// const { auth } = require('express-oauth2-jwt-bearer');
// require('dotenv').config();


const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");



const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-4xlxb5a75bgzk3js.us.auth0.com/.well-known/jwks.json",
  }),
  audience: "https://text-to-learn-api",
  issuer: "https://dev-4xlxb5a75bgzk3js.us.auth0.com/",
  algorithms: ["RS256"],
});


module.exports = checkJwt;