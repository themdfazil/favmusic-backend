const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await 
        pool.query("SELECT * FROM users");
        res.json(result.rows);

    }catch (error) {
        console.error(error);
        res.status(500).json({ error:
            error.message
        });
    }

});

router.post("/login", async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);

    try {
        const result = await pool.query(
            "INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, password]
        );

        
        return res.status(200).json({
            message: "login success",
            user: result.rows[0],
            
        });

        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;