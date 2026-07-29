const jwt = require("jsonwebtoken");
const User = require("../models/User");

// MIDDLEWARE = a function that runs BETWEEN the incoming request and your
// route's controller. It can inspect/modify the request, or block it entirely.
// Express middleware signature is always (req, res, next).
//
// This one runs on any route we want to lock down (e.g. "upload property").
// It checks for a valid JWT in the Authorization header, and if valid,
// attaches the actual user document to req.user so controllers can use it.
const protect = async (req, res, next) => {
  let token;

  // Frontend sends the token as: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // grab the part after "Bearer "

      // jwt.verify throws an error if the token is invalid, expired, or tampered with.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from DB (minus password) and attach to the request object.
      // Every controller after this middleware can now access req.user.
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      next(); // hand control to the next function in the chain (the actual controller)
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// ROLE-BASED ACCESS: a middleware FACTORY. Call it with allowed roles,
// it returns a middleware function. e.g. authorize("seller") only lets sellers through.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not permitted to perform this action`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
