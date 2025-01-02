const express = require("express");
const { check } = require("express-validator");
const superAdminController = require("../controllers/superAdminController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protect all routes for super_admin role
router.use(authenticate("super_admin"));

// Render Create User Form
router.get("/createUser", superAdminController.renderCreateUser);

// Handle Create User Form Submission
router.post(
  "/createUser",
  [
    check("name").trim().notEmpty().withMessage("Name is required."),
    check("mobile")
      .notEmpty().withMessage("Mobile number is required.")
      .isMobilePhone("id-ID").withMessage("Invalid mobile number format."),
    check("email")
      .notEmpty().withMessage("Email is required.")
      .isEmail().withMessage("Invalid email format."),
    check("password")
      .notEmpty().withMessage("Password is required.")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    check("role")
      .notEmpty().withMessage("Role is required.")
      .isIn(["customer", "admin_sales", "super_admin"]).withMessage("Invalid role."),
  ],
  superAdminController.createUser
);

module.exports = router;
