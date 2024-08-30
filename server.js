const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());

// Configure Azure SQL Database connection
const dbConfig = {
  server: 'supershowdown.database.windows.net',
  database: 'Players',
  user: 'rjwalter010@gmail.com',
  password: 'potatoskins',
  options: {
    encrypt: true, // For security
    trustServerCertificate: false, // Change as needed
  },
};

const PORT = 1433;

// Serve static files (including client.js) from a directory
app.use(express.static(path.join(__dirname, 'public')));

// Define an endpoint to handle form submissions
app.post('/submit-picks', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    // Assuming the data is sent as an array of checkbox values
    const picks = req.body.picks || [];

    // Iterate through the picks and insert them into the database
    for (const pick of picks) {
      const query = `
        INSERT INTO picks (Picks)
        VALUES (@Pick)
      `;

      const result = await pool.request()
        .input('Pick', sql.VarChar, pick)
        .query(query);
    }

    res.status(200).json({ message: 'Picks submitted successfully' });
  } catch (error) {
    console.error('Error submitting picks:', error);
    res.status(500).json({ error: 'An error occurred while submitting picks' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});