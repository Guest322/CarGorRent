const pool = require('../conn/dbPostgres');

// Register a new user
const createUser = async (name, mobile, email, hashedPassword) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userRes = await client.query(
            'INSERT INTO user_data (name, mobile, status) VALUES ($1, $2, $3) RETURNING user_id',
            [name, mobile, 'Available']
        );

        const userId = userRes.rows[0].user_id;

        await client.query(
            'INSERT INTO user_login (user_id, email, password, role) VALUES ($1, $2, $3, $4)',
            [userId, email, hashedPassword, 'customer']
        );

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Get user by email
const getUserByEmail = async (email) => {
    const qw = `
        SELECT 
            ul.login_id, 
            ul.email,
            ul.password, 
            ul.role, 
            ud.status
        FROM 
            user_login ul
        JOIN 
            user_data ud
        ON 
            ul.user_id = ud.user_id
        WHERE 
            ul.email = '${email}'
    `;
    const result = await pool.query(qw);
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    try {
      const result = await pool.query(
        "SELECT * FROM user_login WHERE email = $1",
        [email]
      );
      return result.rows[0]; // Return the user if found, otherwise null
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

module.exports = { createUser, getUserByEmail, findUserByEmail };
