const jwt = require("jsonwebtoken");

const authenticate = (role) => {
  return (req, res, next) => {
    const token = req.cookies.token; // Get the token from cookies
    console.log(token, "ini dari middleware");
    
    if (!token) {
      // If there is no token, redirect to login page
      return res.redirect("/auth/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
      req.user = decoded; // Store the decoded token in the request object

      // If a role is provided, check if the user's role matches the required role
      if (role && decoded.role !== role) {
        return res.status(403).send("Access Denied");
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      // If token verification fails, redirect to login page
      return res.redirect("/auth/login");
    }
  };
};

module.exports = authenticate;
