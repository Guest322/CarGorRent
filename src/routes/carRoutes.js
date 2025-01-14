const express = require('express');
const carController = require('../controllers/carController');

const router = express.Router();

// Route for showing all cars with pagination
router.get('/', carController.showAllCars);

// Route for searching cars by seat
router.get('/search', carController.searchCarsBySeat);

// Route to display car details
router.get('/cars/:id', carController.showCarDetails);

// Route for processing booking with date validation
// router.post('/orders/process', [
//   // Validate start and end dates
//   body('dateStart')
//     .isISO8601()
//     .withMessage('Start date is required and should be in a valid format'),
//   body('dateEnd')
//     .isISO8601()
//     .withMessage('End date is required and should be in a valid format'),
//   body('dateEnd').custom((value, { req }) => {
//     const startDate = new Date(req.body.dateStart);
//     const endDate = new Date(value);
//     if (endDate <= startDate) {
//       throw new Error('End date must be after the start date');
//     }
//     return true;
//   }),
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const car = await carModel.getCarById(req.body.carId);
//     return res.render('customer/carDetail', {
//       title: "avanza",
//       errors: errors.array(),
//       car,
//     });
//   }
//   // Call the processOrder controller method if no validation errors
//   orderController.processOrder(req, res);
// });

module.exports = router;
