const pool = require('../conn/dbPostgres');

// Get user_id from login_id because the cookie id is login_id
const getUserIdByLoginId = async (loginId) => {
    const result = await pool.query(
        `SELECT user_id FROM user_login WHERE login_id = $1;`,
        [loginId]
    );
    return result.rows[0]?.user_id || null; // Return null if no user_id is found
};


// Create new order
const createOrder = async (orderData) => {
    const {
        userId, carId, driver, fuel, eTol, dateStart, dateEnd, totalPrice,
    } = orderData;

    const client = await pool.connect(); // Start a database transaction
    try {
        await client.query('BEGIN'); // Begin transaction

        // Insert the order into the database
        const orderResult = await client.query(
            `INSERT INTO order_data (user_id, car_id, driver, fuel, e_tol, date_start, date_end, status, total_price) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING order_id`,
            [userId, carId, driver, fuel, eTol, dateStart, dateEnd,'Processing', totalPrice]
        );

        // const orderId = orderResult.rows[0].order_id;

        // Update the car's status to 'lending'
        await client.query(
            `UPDATE car_data SET status = $1 WHERE car_id = $2`,
            ['Booked',carId]
        );

        await client.query('COMMIT'); // Commit transaction
        return orderResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction in case of an error
        throw error;
    } finally {
        client.release(); // Release the client back to the pool
    }
};


// Create order document
const createOrderDocument = async (docData) => {
    const { orderId, ktp, kk, simA, transfer } = docData;

    await pool.query(
        `INSERT INTO order_documents (order_id, ktp, kk, sim_a, transfer) 
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, ktp, kk, simA, transfer]
    );
};

// Get orders with pagination
const getOrdersByCustomerId = async (userId, offset) => {
    const result = await pool.query(
        `SELECT order_data.order_id, order_data.date_start, order_data.date_end, order_data.total_price, order_data.status, car_data.name
        FROM order_data
        JOIN car_data ON order_data.car_id = car_data.car_id
        WHERE order_data.user_id = $1
        LIMIT 5 OFFSET $2;`, // Use LIMIT and OFFSET for pagination
        [userId, offset]
    );
    return result.rows;
};

// Get total orders for pagination (used to calculate total pages)
const getTotalOrdersByCustomerId = async (userId) => {
    const result = await pool.query(
        `SELECT COUNT(*) FROM order_data WHERE user_id = $1;`, 
        [userId]
    );
    return parseInt(result.rows[0].count);
};

// Get orders by status with pagination
const getOrdersByCustomerIdAndStatus = async (userId, status, offset) => {
    let query = `
        SELECT order_data.order_id, order_data.date_start, order_data.date_end, 
               order_data.total_price, order_data.status, car_data.name
        FROM order_data
        JOIN car_data ON order_data.car_id = car_data.car_id
        WHERE order_data.user_id = $1
    `;
    const params = [userId];

    if (status) {
        query += ` AND order_data.status = $2`;
        params.push(status);
    }

    query += ` LIMIT 5 OFFSET $${params.length + 1}`;
    params.push(offset);

    const result = await pool.query(query, params);
    return result.rows;
};



// Get total orders by status for pagination
const getTotalOrdersByCustomerIdAndStatus = async (userId, status) => {
    const query = `
        SELECT COUNT(*) 
        FROM order_data 
        WHERE user_id = $1 
        ${status ? 'AND status = $2' : ''};
    `;
    const params = status ? [userId, status] : [userId];
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
};


module.exports = { getUserIdByLoginId, createOrder, createOrderDocument, getOrdersByCustomerId, getTotalOrdersByCustomerId, getOrdersByCustomerIdAndStatus, getTotalOrdersByCustomerIdAndStatus };
