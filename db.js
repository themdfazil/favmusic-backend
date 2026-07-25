require("dotenv").config();

const { Pool } = require("pg");


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Cloud database ke liye zaroori hai
  }
});

pool.connect()
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.log(err));

module.exports = pool;