const Order = require('../models/adminModel');

// Get all orders with optional search term
const getOrders = async (req, res) => {
    const { search } = req.query;  // Retrieve search term from the query string
    try {
        const orders = await Order.getAllOrders(search || '');
        res.render('admin/adminOrder', { title: "Order Management", orders, search });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Approve order
const approveOrder = async (req, res) => {
    const { order_id } = req.params;  // Get order_id from URL params
    try {
        await Order.approveOrder(order_id);
        res.redirect('/admin/orders');  // Redirect to the orders page after update
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Deny order
const denyOrder = async (req, res) => {
    const { order_id } = req.params;
    try {
        await Order.denyOrder(order_id);
        res.redirect('/admin/orders');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Get cars with orders for adminCar.ejs
const getCarsWithOrders = async (req, res) => {
    const { search } = req.query; // Retrieve search term from the query string
    try {
      const cars = await Order.getCarsWithOrders(search || '');
      res.render('admin/adminCar', { title: "Car Management", cars, search });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  // Update car status to 'Lending'
  const updateCarToLending = async (req, res) => {
    const { order_id } = req.params;
    try {
      await Order.updateCarToLending(order_id);
      res.redirect('/admin/cars');
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  // Update car status to 'Back'
  const updateCarToBack = async (req, res) => {
    const { order_id } = req.params;
    try {
      await Order.updateCarToBack(order_id);
      res.redirect('/admin/cars');
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  module.exports = { 
    getOrders, 
    approveOrder, 
    denyOrder, 
    getCarsWithOrders, 
    updateCarToLending, 
    updateCarToBack 
};
