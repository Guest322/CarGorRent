const carModel = require('../models/carModel');


// Controller to handle car search by seat count
const searchCarsBySeat = async (req, res) => {
    const seat = req.query.seat || ''; // Seat filter from query parameter
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = 9; // Number of cars per page
    const offset = (page - 1) * limit; // Offset for pagination

    try {
        let cars, totalCars;

        // If seat is specified, filter by seat
        if (seat) {
            cars = await carModel.getCarsBySeat(seat, offset);
            totalCars = await carModel.countCars(seat);  // Count filtered cars
        } else {
            // If no seat is specified, display all cars
            cars = await carModel.getAllCars(offset);
            totalCars = await carModel.countCars();  // Count all cars
        }

        // Correct calculation of totalPages
        const totalPages = Math.ceil(totalCars / limit);

        res.render('index', {
            cars,
            seat,
            totalPages,
            currentPage: page,
            title: 'Car Search',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred while retrieving cars');
    }
};

// Controller to handle displaying all cars (index page)
const showAllCars = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = 9; // Cars per page
    const offset = (page - 1) * limit; // Offset for pagination

    try {
        // Fetch all cars for the current page
        const cars = await carModel.getAllCars(offset);

        // Fetch the total number of available cars
        const totalCarsResult = await carModel.countCars(); // Use countCars without seat filter
        const totalCars = parseInt(totalCarsResult); // Parse count to integer

        // Calculate total pages
        const totalPages = Math.ceil(totalCars / limit);

        // Render the index page
        res.render('index', {
            cars,
            totalPages,
            seat: '', // No seat filter applied
            currentPage: page,
            title: 'All Cars',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred while retrieving cars');
    }
};


const showCarDetails = async (req, res) => {
    const carId = req.params.id;

    try {
        const car = await carModel.getCarById(carId);
        res.render('customer/carDetail', { title: car.name, errors: [] ,car });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading car details.');
    }
};

module.exports = { searchCarsBySeat, showAllCars, showCarDetails };
