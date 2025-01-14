const pool = require('../conn/dbPostgres');

// Fetch all orders with related data, sorted by order_id (FIFO)
const getAllOrders = async (searchTerm = '') => {
    const query = `
        SELECT 
            o.order_id, 
            u.name AS user_name, 
            c.registration_number, 
            od.ktp, 
            od.kk, 
            od.sim_a, 
            od.transfer, 
            o.status 
        FROM order_data o
        JOIN user_data u ON o.user_id = u.user_id
        JOIN car_data c ON o.car_id = c.car_id
        LEFT JOIN order_documents od ON o.order_id = od.order_id
        WHERE o.order_id::text LIKE $1
        ORDER BY o.order_id ASC;  -- FIFO order by order_id
    `;
    const values = [`%${searchTerm}%`];
    const result = await pool.query(query, values);
    return result.rows;
};

// Update order status to 'Approve'
const approveOrder = async (order_id) => {
    const client = await pool.connect(); // Use a transaction to ensure atomicity
    try {
      await client.query('BEGIN'); // Start transaction
  
      // Update order status to 'Approve'
      const updateOrderQuery = `
        UPDATE order_data 
        SET status = 'Approve' 
        WHERE order_id = $1;
      `;
      await client.query(updateOrderQuery, [order_id]);
  
      // Update car status to 'Lending'
      const updateCarQuery = `
        UPDATE car_data 
        SET status = 'Booked' 
        WHERE car_id = (
          SELECT car_id 
          FROM order_data 
          WHERE order_id = $1
        );
      `;
      await client.query(updateCarQuery, [order_id]);
  
      await client.query('COMMIT'); // Commit transaction
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback transaction on error
      console.error("Error approving order:", error);
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  };

// Update order status to 'Deny'
const denyOrder = async (order_id) => {
    const client = await pool.connect(); // Use a transaction to ensure atomicity
    try {
      await client.query('BEGIN'); // Start transaction
  
      // Update order status to 'Deny'
      const updateOrderQuery = `
        UPDATE order_data 
        SET status = 'Deny' 
        WHERE order_id = $1;
      `;
      await client.query(updateOrderQuery, [order_id]);
  
      // Update car status to 'Available'
      const updateCarQuery = `
        UPDATE car_data 
        SET status = 'Available' 
        WHERE car_id = (
          SELECT car_id 
          FROM order_data 
          WHERE order_id = $1
        );
      `;
      await client.query(updateCarQuery, [order_id]);
  
      await client.query('COMMIT'); // Commit transaction
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback transaction on error
      console.error("Error denying order:", error);
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  };

  const getCarsWithOrders = async (searchTerm = '') => {
    const query = `
      SELECT 
        o.order_id,
        c.brand,
        c.name AS car_name,
        c.registration_number,
        c.main_image,
        u.name AS user_name,
        u.mobile,
        ul.email,
        o.date_start,
        o.date_end,
        o.total_price,
        c.status AS car_status
      FROM order_data o
      JOIN car_data c ON o.car_id = c.car_id
      JOIN user_data u ON o.user_id = u.user_id
      JOIN user_login ul ON u.user_id = ul.user_id
      WHERE c.status IN ('Booked', 'Lending', 'Back')
        AND c.registration_number ILIKE $1
      ORDER BY o.order_id ASC;
    `;
    const values = [`%${searchTerm}%`];
    const result = await pool.query(query, values);
    return result.rows;
  };
  
  // Update car status to 'Lending'
  const updateCarToLending = async (order_id) => {
    const query = `
      UPDATE car_data 
      SET status = 'Lending' 
      WHERE car_id = (
        SELECT car_id 
        FROM order_data 
        WHERE order_id = $1
      );
    `;
    await pool.query(query, [order_id]);
  };
  
  // Update car status to 'Back'
  const updateCarToBack = async (order_id) => {
    const client = await pool.connect(); // Use a transaction for atomicity
    try {
        await client.query('BEGIN'); // Start transaction

        // Update car status to 'Back'
        const updateCarQuery = `
            UPDATE car_data 
            SET status = 'Back' 
            WHERE car_id = (
                SELECT car_id 
                FROM order_data 
                WHERE order_id = $1
            );
        `;
        await client.query(updateCarQuery, [order_id]);

        // Update order status to 'Finish'
        const updateOrderQuery = `
            UPDATE order_data 
            SET status = 'Finish' 
            WHERE order_id = $1;
        `;
        await client.query(updateOrderQuery, [order_id]);

        await client.query('COMMIT'); // Commit transaction
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        console.error("Error updating car to 'Back':", error);
        throw error;
    } finally {
        client.release(); // Release the client back to the pool
    }
};


module.exports = { 
  getAllOrders, 
  approveOrder, 
  denyOrder, 
  getAllOrders, 
  approveOrder, 
  denyOrder, 
  getCarsWithOrders, 
  updateCarToLending, 
  updateCarToBack 
};
