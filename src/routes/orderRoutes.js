const express = require('express');
const orderController = require('../controllers/orderController');
const {authenticate} = require("../middlewares/authMiddleware");
const upload = require('../middlewares/upload'); // Using the configured upload instance



const router = express.Router();

router.post('/process', authenticate("customer","car_owner"), upload.fields([
  { name: 'ktp', maxCount: 1 },
  { name: 'kk', maxCount: 1 },
  { name: 'simA', maxCount: 1 },
  { name: 'transfer', maxCount: 1 }
]), orderController.processOrder);  

router.get('/viewOrder', authenticate("customer","car_owner"), orderController.viewOrders);

module.exports = router;
