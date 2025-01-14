const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const superAdminController = require("../controllers/superAdminController");
const { authenticate } = require("../middlewares/authMiddleware");
const userModel = require("../models/userModel"); // Import your auth model

const router = express.Router();

// Custom validator to check if email is unique
const checkUniqueEmail = async (email) => {
  const user = await userModel.findUserByEmail(email);
  if (user) {
    throw new Error("Email already exists.");
  }
  return true;
};

router.get("/register", (req, res) => res.render("register", { title: "Register", errors: [], oldInput: {} }));
router.post(
  "/register",
  [
    check("name")
      .trim()
      .notEmpty().withMessage('Nama wajib diisi.')
      .isLength({ min: 1 }).withMessage('Nama tidak boleh hanya terdiri dari spasi.'),
    check("mobile")
      .notEmpty().withMessage("Nomor Telepon Wajib Diisi.")
      .isMobilePhone('id-ID').withMessage('Format nomor telepon tidak valid.'),
    check("email")
      .isEmail().withMessage("Email Wajib Diisi.")
      .custom(checkUniqueEmail), // Add custom email uniqueness check
    check("password")
      .isLength({ min: 6 }).withMessage("Password Harus Setidaknya Memiliki 6 Karakter"),
    check("confirmPassword")
      .custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match.")
  ],
  authController.register
);

router.get("/login", (req, res) => res.render("login", { title: "Login", errors: [], oldInput: {} }));
router.post(
  "/login",
  [
    check("email")
      .isEmail().withMessage("Email is invalid"),
    check("password")
      .notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

router.get("/customerDashboard", authenticate("customer", "car_owner"), (req, res) => res.render("customer/customerDashboard", { title: "Customer Dashboard" }));
router.get("/adminDashboard", authenticate("admin_sales", "admin_mechanic"), (req, res) => res.render("admin/adminDasboard", { title: "Admin Dashboard" }));
router.get("/superAdminDashboard", authenticate("super_admin"), superAdminController.renderSuperAdminDashboard);

module.exports = router;