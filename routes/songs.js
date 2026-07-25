const express = require("express");
const router = express.Router();
const multer = require("multer");
const pool = require("../db");
const { createClient } = require ("@supabase/supabase-js");


const supabase = createClient( process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY);

    const storage = multer.memoryStorage();
    const upload = multer({
        storage: storage,
    });

    router.post("/upload", upload.single("song"), async (req, res) => {
        console.log("upld fail ayi :", req.body);
        console.log("file mili :", req.body);

        try {
            const { title, artist, user_id } = req.body;
            const file = req.file;


            if (!file) {
                return res.status(400).json({
                    message: "No file selected"
                });
            
            }
            const fileName = `${Date.now()}-${file.originalname}`;
            const { error } = await supabase.storage
            .from("songs")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });
        

            if (error) throw error;

            const { data } = supabase.storage
            .from("songs")
            .getPublicUrl(fileName);

            const song_url = data.publicUrl;

            const result = await pool.query(
                "INSERT INTO songs(title, artist, song_url, user_id) VALUES($1, $2, $3, $4) RETURNING *",
                [title, artist, song_url, user_id ]
            );

            res.status(200).json({
                message: "song sucess",
                song: result.rows[0]
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: error.message,
            });
        }
    });
    router.get("/", async (req, res) => {
        try {
            const result = await pool.query("SELECT *FROM songs ORDER BY id DESC");
            res.json(result.rows);
        }catch (err) {
            console.error(err);

            res.status(500).json({ message: "server error"});
        }
    })

    router.delete("/:id", async (req, res) => {
        try {
            await pool.query(
                "DELETE FROM songs WHERE id=$1",
                [req.params.id]
            );
            res.json({ message: "song deleted"});

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message});
        }
    });


    

    module.exports = router