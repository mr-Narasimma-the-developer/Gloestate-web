const jwt = require("jsonwebtoken");

// A JWT (JSON Web Token) is how the server proves "this request really came
// from a logged-in user" WITHOUT storing session data on the server.
//
// The token is a signed string containing the user's id (the "payload").
// Because it's signed with JWT_SECRET, the server can later verify it wasn't
// tampered with -- but anyone can technically READ the payload (it's not encrypted,
// just signed), so never put passwords or sensitive data inside it.
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // payload: what we're encoding into the token
    process.env.JWT_SECRET, // secret key used to sign it (keep this out of GitHub!)
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = generateToken;
