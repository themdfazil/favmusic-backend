require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
}); // <--- Yahan par closing brace '}' missing tha!

pool.connect()
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.log(err));

module.exports = pool;
