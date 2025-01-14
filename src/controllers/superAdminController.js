const { validationResult } = require("express-validator");
const superAdminModel = require("../models/superAdminModel");

// Render the "Create User" Page with Filtering
const renderCreateUser = async (req, res) => {
  try {
    const { user_id, name, email, status, role } = req.query;

    // Fetch filtered admin users based on filters
    const usersResult = await superAdminModel.getFilteredAdminUsers(user_id, name, email, status, role);

    // Ensure filters object is always defined
    const filters = {
      user_id: user_id || '',
      name: name || '',
      email: email || '',
      status: status || '',
      role: role || '',
    };

    res.render("superAdmin/createUser", {
      title: "Create User",
      errors: [],
      oldInput: {},
      users: usersResult,
      filters, // Pass filters to the view
    });
  } catch (error) {
    console.error(error);
    res.redirect("/superadmin/createUser");
  }
};

// Handle User Creation
const createUser = async (req, res) => {
  const errors = validationResult(req);

  try {
    // Fetch users to display them regardless of the outcome
    const usersResult = await superAdminModel.getAdminUsers();

    if (!errors.isEmpty()) {
      return res.render("superAdmin/createUser", {
        title: "Create User",
        errors: errors.array(),
        oldInput: req.body,
        users: usersResult,
        filters: {}, // Pass an empty filters object if no filters are applied
      });
    }

    const { name, mobile, email, password, role } = req.body;

    const { success, error } = await superAdminModel.createUserInDatabase(
      name, mobile, email, password, role
    );

    if (success) {
      return res.redirect("/superadmin/createUser");
    } else {
      // Render the page with an error message
      return res.render("superAdmin/createUser", {
        title: "Create User",
        errors: [{ msg: "Error creating user. Please try again later." }],
        oldInput: req.body,
        users: usersResult,
        filters: {}, // Pass an empty filters object if no filters are applied
      });
    }
  } catch (error) {
    console.error(error);
    res.redirect("/superadmin/createUser");
  }
};

const renderSuperAdminDashboard = async (req, res) => {
  try {
    // Fetch data for the dashboard
    const totalRevenue = await superAdminModel.getTotalRevenue();
    const totalOrders = await superAdminModel.getTotalOrders();
    const totalUsers = await superAdminModel.getTotalUsers();
    const totalCars = await superAdminModel.getTotalCars();
    const recentOrders = await superAdminModel.getRecentOrders();
    const newUsers = await superAdminModel.getNewUsers();
    const notifications = await superAdminModel.getNotifications();
    const monthlyRevenueData = await superAdminModel.getMonthlyRevenueData();
    const monthlyOrdersData = await superAdminModel.getMonthlyOrdersData();

    console.log("Monthly Revenue Data:", monthlyRevenueData);
    console.log("Monthly Orders Data:", monthlyOrdersData);

    res.render("superAdmin/superAdminDashboard", {
      title: "Super Admin Dashboard",
      totalRevenue,
      totalOrders,
      totalUsers,
      totalCars,
      recentOrders,
      newUsers,
      notifications,
      revenueLabels: monthlyRevenueData.labels,
      revenueData: monthlyRevenueData.data,
      ordersLabels: monthlyOrdersData.labels,
      ordersData: monthlyOrdersData.data,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/auth/superAdminDashboard");
  }
};

module.exports = { renderCreateUser, createUser, renderSuperAdminDashboard };
