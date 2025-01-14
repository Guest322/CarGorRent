const pool = require("../conn/dbPostgres");
const bcrypt = require("bcryptjs");

const createUserInDatabase = async (name, mobile, email, password, role) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into user_data
    const userDataResult = await pool.query(
      "INSERT INTO user_data (name, mobile, status) VALUES ($1, $2, $3) RETURNING user_id",
      [name, mobile, "Available"]
    );

    const userId = userDataResult.rows[0].user_id;

    // Insert into user_login
    await pool.query(
      "INSERT INTO user_login (user_id, email, password, role) VALUES ($1, $2, $3, $4)",
      [userId, email, hashedPassword, role]
    );

    return { success: true, userId };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};

// Get Admin Users (Fetch from both user_data and user_login)
const getAdminUsers = async () => {
  try {
    const result = await pool.query(
      `SELECT ud.user_id, ud.name, ul.email, ul.role, ud.status 
       FROM user_data ud 
       INNER JOIN user_login ul ON ud.user_id = ul.user_id
       WHERE ul.role IN ('admin_sales', 'admin_mechanic', 'super_admin')`
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const changeUserStatus = async (user_id, status) => {
    try {
      await pool.query(
        `UPDATE user_data SET status = $1 WHERE user_id = $2`,
        [status, user_id]
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  const getFilteredAdminUsers = async (user_id, name, email, status, role) => {
    try {
      let query = `
        SELECT ud.user_id, ud.name, ul.email, ul.role, ud.status 
        FROM user_data ud 
        INNER JOIN user_login ul ON ud.user_id = ul.user_id
        WHERE ul.role IN ('admin_sales', 'admin_mechanic', 'super_admin')
      `;
  
      const queryParams = [];
      let paramIndex = 1;
  
      // Add filters dynamically
      if (user_id) {
        queryParams.push(user_id);
        query += ` AND ud.user_id = $${paramIndex++}`;
      }
  
      if (name) {
        queryParams.push(`%${name}%`);
        query += ` AND ud.name ILIKE $${paramIndex++}`;
      }
  
      if (email) {
        queryParams.push(`%${email}%`);
        query += ` AND ul.email ILIKE $${paramIndex++}`;
      }
  
      if (status) {
        queryParams.push(status);
        query += ` AND ud.status = $${paramIndex++}`;
      }
  
      if (role) {
        queryParams.push(role);
        query += ` AND ul.role = $${paramIndex++}`;
      }
  
      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getTotalRevenue = async () => {
    const result = await pool.query("SELECT SUM(total_price) AS total FROM order_data");
    return result.rows[0].total || 0;
  };
  
  const getTotalOrders = async () => {
    const result = await pool.query("SELECT COUNT(*) AS total FROM order_data");
    return result.rows[0].total || 0;
  };
  
  const getTotalUsers = async () => {
    const result = await pool.query("SELECT COUNT(*) AS total FROM user_login");
    return result.rows[0].total || 0;
  };
  
  const getTotalCars = async () => {
    const result = await pool.query("SELECT COUNT(*) AS total FROM car_data");
    return result.rows[0].total || 0;
  };
  
  const getRecentOrders = async () => {
    const result = await pool.query("SELECT * FROM order_data ORDER BY order_id DESC LIMIT 5");
    return result.rows;
  };
  
  const getNewUsers = async () => {
    const result = await pool.query("SELECT * FROM user_login ORDER BY login_id DESC LIMIT 5");
    return result.rows;
  };
  
  const getNotifications = async () => {
    // Example notifications (customize as needed)
    return [
      { message: "5 new orders pending approval", date: "2024-04-01" },
      { message: "2 new cars added", date: "2024-04-02" },
    ];
  };
  
  const getMonthlyRevenueData = async () => {
    try {
      const result = await pool.query(`
        SELECT DATE_TRUNC('month', date_start) AS month, SUM(total_price) AS revenue
        FROM order_data
        GROUP BY month
        ORDER BY month
      `);
  
      // Add dummy data for testing
      const dummyData = [
        { month: new Date('2024-01-01'), revenue: 1000000 },
        { month: new Date('2024-02-01'), revenue: 1500000 },
        { month: new Date('2024-03-01'), revenue: 2000000 },
      ];
  
      const combinedData = result.rows.concat(dummyData);
  
      return {
        labels: combinedData.map(row => row.month.toISOString().slice(0, 7)), // Format as "YYYY-MM"
        data: combinedData.map(row => Number(row.revenue)), // Convert to number
      };
    } catch (error) {
      console.error("Error fetching monthly revenue data:", error);
      return { labels: [], data: [] }; // Return empty data in case of error
    }
  };
  
  const getMonthlyOrdersData = async () => {
    try {
      const result = await pool.query(`
        SELECT DATE_TRUNC('month', date_start) AS month, COUNT(*) AS orders
        FROM order_data
        GROUP BY month
        ORDER BY month
      `);
      return {
        labels: result.rows.map(row => row.month.toISOString().slice(0, 7)), // Format as "YYYY-MM"
        data: result.rows.map(row => Number(row.orders)), // Convert to number
      };
    } catch (error) {
      console.error("Error fetching monthly orders data:", error);
      return { labels: [], data: [] }; // Return empty data in case of error
    }
  };
  
  module.exports = { 
    createUserInDatabase, 
    getAdminUsers, 
    getFilteredAdminUsers, 
    changeUserStatus, 
    getTotalRevenue,
    getTotalOrders,
    getTotalUsers,
    getTotalCars,
    getRecentOrders,
    getNewUsers,
    getNotifications,
    getMonthlyRevenueData,
    getMonthlyOrdersData,
  };
  