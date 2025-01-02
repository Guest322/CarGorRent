const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createUser, getUserByEmail } = require('../models/userModel');

const register = async (req, res) => {
    const { name, mobile, email, password, passwordConfirm } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('register', { title: "Register", errors: errors.array(), oldInput: req.body });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(name, mobile, email, hashedPassword);
        res.redirect('/auth/login');
    } catch (error) {
        res.render('register', { title: "Register", errors: [{ msg: 'Server error' }], oldInput: req.body });
        console.log(error);
        
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login', { title: "Login", errors: errors.array(), oldInput: req.body });
    }

    try {
        const user = await getUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { title: "Login", errors: [{ msg: 'Invalid credentials.' }], oldInput: req.body });
        }

        const token = jwt.sign({ id: user.login_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000,
          });

        // Redirect based on role
        if (user.role === "customer") return res.redirect("/auth/customerDashboard");
        if (user.role === "admin_sales") return res.redirect("/auth/adminDashboard");
        if (user.role === "super_admin") return res.redirect("/auth/superAdminDashboard");
    } catch (error) {
        res.render('login', { title: "Login", errors: [{ msg: 'Server error.' }], oldInput: req.body });
        console.log(error);
    }
};

module.exports = {register, login};
