const orderModel = require('../models/orderModel');
const carModel = require('../models/carModel'); // Import the user model
const path = require('path');

const processOrder = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * 9;

    try {
        // Ensure the user is authenticated
        if (!req.userId) {
            return res.status(401).send('User not authenticated.');
        }

        // Fetch the user_id using login_id (req.userId is login_id)
        const userId = await orderModel.getUserIdByLoginId(req.userId);
        if (!userId) {
            return res.status(400).send('Invalid login ID.');
        }

        // Fetch car details to calculate the total price
        const car = await carModel.getCarById(req.body.carId);

        // Parse dates
        const startDate = new Date(req.body.dateStart);
        const endDate = new Date(req.body.dateEnd);

        // Calculate the time difference in milliseconds
        const diffTime = endDate - startDate;
        const diffDays = diffTime / (1000 * 3600 * 24); // Convert to days

        // Calculate total price
        let totalPrice = car.price_perday * diffDays;

        // Add additional costs if options are selected
        if (req.body.driver === 'on') {
            totalPrice += 250000; // Example price for adding a driver
        }
        if (req.body.fuel === 'on') {
            totalPrice += 200000; // Example price for adding fuel
        }
        if (req.body.eTol === 'on') {
            totalPrice += 100000; // Example price for adding e-Tol
        }

        // Calculate transfer fee (10% of total price)
        const transferFee = totalPrice * 0.10;

        // Create the order data
        const orderData = {
            userId, // Use the fetched user_id
            carId: req.body.carId,
            driver: req.body.driver === 'on',
            fuel: req.body.fuel === 'on',
            eTol: req.body.eTol === 'on',
            dateStart: req.body.dateStart,
            dateEnd: req.body.dateEnd,
            totalPrice: totalPrice,
        };

        // Create the order in the database
        const { order_id } = await orderModel.createOrder(orderData);

        // Process documents (e.g., KTP, KK, SIM A)
        const docData = {
            orderId: order_id,
            ktp: req.files.ktp ? path.basename(req.files.ktp[0].path) : null,
            kk: req.files.kk ? path.basename(req.files.kk[0].path) : null,
            simA: req.files.simA ? path.basename(req.files.simA[0].path) : null,
            transfer: req.files.transfer ? path.basename(req.files.transfer[0].path) : null,
        };

        await orderModel.createOrderDocument(docData);

        // Send the data back to the frontend for rendering in the modal
        const cars = await carModel.getAllCars(offset);
        const totalCars = await carModel.getAllCars(); // Get the total number for pagination
        const totalPages = Math.ceil(totalCars.length / 9);

        res.render('index', {
            cars,
            totalPages,
            seat: '',
            currentPage: page,
            title: 'All Cars',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing order.');
    }
};

// Controller method to render the customer's orders
const viewOrders = async (req, res) => {
  try {
      // Fetch the user_id using login_id (req.userId is login_id)
      const userId = await orderModel.getUserIdByLoginId(req.userId);
      if (!userId) {
          return res.status(400).send('Invalid login ID.');
      }
      
      const page = parseInt(req.query.page) || 1;
      const status = req.query.status || null; // Get the status from the query or default to null
      const offset = (page - 1) * 5;

      // Fetch the orders with pagination and optional status filter
      const orders = await orderModel.getOrdersByCustomerIdAndStatus(userId, status, offset);

      // Fetch the total number of orders for pagination
      const totalOrders = await orderModel.getTotalOrdersByCustomerIdAndStatus(userId, status);
      const totalPages = Math.ceil(totalOrders / 5);

      res.render('customer/customerOrder', {
          title: 'Orders',
          orders,
          totalPages,
          currentPage: page,
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
};
  
module.exports = { processOrder, viewOrders};