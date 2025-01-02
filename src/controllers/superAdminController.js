const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const pool = require("../conn/dbPostgres"); // Replace with your DB connection setup

// Render the "Create User" Page
exports.renderCreateUser = (req, res) => {
  res.render("superAdmin/createUser", { title: "Create User", errors: [], oldInput: {} });
};

// Handle User Creation
exports.createUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("superAdmin/createUser", {
      title: "Create User",
      errors: errors.array(),
      oldInput: req.body,
    });
  }

  const { name, mobile, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into user_data
    const userDataResult = await pool.query(
      "INSERT INTO user_data (name, mobile, status) VALUES ($1, $2, $3) RETURNING user_id",
      [name, mobile, "Available"]
    );

    const userId = userDataResult.rows[0].user_id;

    // Insert into user_login
    await pool.query(
      "INSERT INTO user_login (user_id, email, password, role) VALUES ($1, $2, $3, $4)",
      [userId, email, hashedPassword, role]
    );

    res.redirect("/superadmin/createUser");
  } catch (error) {
    console.error(error);
    res.redirect("/superadmin/createUser");
  }
};
