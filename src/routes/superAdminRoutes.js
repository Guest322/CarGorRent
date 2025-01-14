const express = require("express");
const { check, body } = require("express-validator");
const superAdminController = require("../controllers/superAdminController");
const superAdminModel = require("../models/superAdminModel");
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
    check("confirmPassword")
      .custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match."),
    check("role")
      .notEmpty().withMessage("Role is required.")
      .isIn(["customer", "admin_sales", "super_admin"]).withMessage("Invalid role."),
    check("role")
      .notEmpty().withMessage("Role is required.")
      .isIn(["customer", "admin_sales", "admin_mechanic", "super_admin"]).withMessage("Invalid role."),    
  ],
  superAdminController.createUser
);

// superAdminRoute.js
router.post("/changeStatus", async (req, res) => {
  const { user_id, status } = req.body;

  try {
    // Logic to change the user's status
    await superAdminModel.changeUserStatus(user_id, status);
    res.redirect("/superadmin/createUser");
  } catch (error) {
    console.error(error);
    res.redirect("/superadmin/createUser");
  }
});

router.get("/createUser", superAdminController.renderCreateUser);

module.exports = router;
