const db = require('../conn/dbPostgres'); // Your database connection

const createOrderDocument = async (order_id, ktp, kk, sim_a, transfer) => {
    const query = `
        INSERT INTO order_document 
        (order_id, ktp, kk, sim_a, transfer) 
        VALUES ($1, $2, $3, $4, $5);
    `;

    const values = [order_id, ktp, kk, sim_a, transfer];

    try {
        await db.query(query, values);
    } catch (err) {
        console.error('Error creating order document:', err);
        throw err;
    }
};

const getOrderDocumentsByOrderId = async (order_id) => {
    const query = 'SELECT * FROM order_document WHERE order_id = $1;';
    try {
        const result = await db.query(query, [order_id]);
        return result.rows;
    } catch (err) {
        console.error('Error fetching order documents:', err);
        throw err;
    }
};

module.exports = { createOrderDocument, getOrderDocumentsByOrderId };
