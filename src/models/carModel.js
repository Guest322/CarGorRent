const pool = require('../conn/dbPostgres');

// Fetch car details by ID (Only if the car is available)
const getCarById = async (carId) => {
    const result = await pool.query(
        'SELECT * FROM car_data WHERE car_id = $1 AND status = $2',
        [carId, 'Available']
    );
    return result.rows[0];
};

// Get cars by seat count (Only available cars)
const getCarsBySeat = async (seat, offset = 0) => {
    const result = await pool.query(
        'SELECT * FROM car_data WHERE seat = $1 AND status = $2 LIMIT 9 OFFSET $3',
        [seat, 'Available', offset]
    );
    return result.rows;
};

// Get all cars (Only available cars for pagination or general listing)
const getAllCars = async (offset = 0) => {
    const result = await pool.query(
        'SELECT * FROM car_data WHERE status = $1 LIMIT 9 OFFSET $2',
        ['Available', offset]
    );
    return result.rows;
};

// Get car details by registration number (Only if the car is available)
const getCarByRegistrationNumber = async (registrationNumber) => {
    const result = await pool.query(
        'SELECT * FROM car_data WHERE registration_number = $1 AND status = $2',
        [registrationNumber, 'Available']
    );
    return result.rows[0]; // Assuming unique registration numbers
};

// Count cars by seat (Only available cars)
const countCars = (seat = '') => {
    let query = 'SELECT COUNT(*) FROM car_data WHERE status = $1';
    let params = ['Available'];

    if (seat) {
        query += ' AND seat = $2';
        params.push(seat);
    }

    return pool.query(query, params)
        .then(result => result.rows[0].count)
        .catch(err => {
            console.error(err);
            throw err;
        });
};

module.exports = { getCarById, getCarsBySeat, getAllCars, getCarByRegistrationNumber, countCars };
