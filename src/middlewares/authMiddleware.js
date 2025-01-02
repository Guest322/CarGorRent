const jwt = require("jsonwebtoken");

// Middleware to set user info globally
const setUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.locals.user = null; // No user logged in
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded; // Make user info available in views
  } catch (err) {
    res.locals.user = null; // Invalid or expired token
  }

  next();
};

// Role-based authentication middleware
const authenticate = (role) => {
  return (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      res.locals.user = null;
      return res.redirect("/auth/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = decoded;

      if (role && decoded.role !== role) {
        return res.status(403).send("Access Denied");
      }

      next();
    } catch (error) {
      res.locals.user = null;
      return res.redirect("/auth/login");
    }
  };
};

module.exports = { authenticate, setUser };
