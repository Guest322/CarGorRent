const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

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
      .isEmail().withMessage("Email Wajib Diisi."),
    check("password")
      .isLength({ min: 6 }).withMessage("Password Harus Setidaknya Memiliki 6 Karakter"),
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

router.get("/customerDashboard", authenticate("customer"), (req, res) => res.render("customer/customerDashboard", { title: "Customer Dashboard" }));
router.get("/adminDashboard", authenticate("admin_sales"), (req, res) => res.render("admin/adminDashboard", { title: "Admin Dashboard" }));
router.get("/superAdminDashboard", authenticate("super_admin"), (req, res) => res.render("superadmin/superAdminDashboard", { title: "Super Admin Dashboard" }));

module.exports = router;
