const express = require('express');
const router = express.Router();
const orderController = require('../controllers/adminController');
const { authenticate } = require("../middlewares/authMiddleware");

// Get all orders with optional search
router.get('/orders', authenticate("admin_sales"), orderController.getOrders);

// Approve order
router.get('/orders/approve/:order_id', authenticate("admin_sales"), orderController.approveOrder);

// Deny order
router.get('/orders/deny/:order_id', authenticate("admin_sales"), orderController.denyOrder);

// Get cars with orders for adminCar.ejs
router.get('/cars', authenticate("admin_sales"), orderController.getCarsWithOrders);

// Update car status to 'Lending'
router.get('/cars/lending/:order_id', authenticate("admin_sales"), orderController.updateCarToLending);

// Update car status to 'Back'
router.get('/cars/back/:order_id', authenticate("admin_sales"), orderController.updateCarToBack);

module.exports = router;