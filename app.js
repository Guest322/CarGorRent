const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const path = require('path');

const authRoutes = require("./src/routes/authRoutes");
const superAdminRoutes = require("./src/routes/superAdminRoutes");
const carRoutes = require('./src/routes/carRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
// const carController = require('./src/controllers/carController');
const orderRoutes = require('./src/routes/orderRoutes');

const { setUser } = require("./src/middlewares/authMiddleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(setUser);

// EJS Setup
app.set("view engine", "ejs");
app.set("layout", "layouts/layout");


// Routes
app.use('/', carRoutes);
app.use("/auth", authRoutes);
app.use("/superAdmin", superAdminRoutes);
app.use("/admin", adminRoutes)
app.use('/cars', carRoutes);
app.use('/orders', orderRoutes);
// app.get('/:id', carController.showCarDetails);


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
