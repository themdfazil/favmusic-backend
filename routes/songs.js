const express = require("express");
const router = express.Router();
const multer = require("multer");
const pool = require("../db");
const { createClient } = require("@supabase/supabase-js");

// Fallback values so Render never crashes if .env variables are missing
const supabaseUrl = process.env.SUPABASE_URL || "https://hjownkztvmelufaopksn.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload Song Route
router.post("/upload", upload.single("song"), async (req, res) => {
    console.log("Req Body:", req.body);
    console.log("Uploaded File:", req.file ? req.file.originalname : "No file");

    try {
        const { title, artist, user_id } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file selected" });
        }

        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        
        // Upload to Supabase Storage Bucket
        const { error: uploadError } = await supabase.storage
            .from("songs")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data } = supabase.storage
            .from("songs")
            .getPublicUrl(fileName);

        const song_url = data.publicUrl;

        // Insert into PostgreSQL
        const result = await pool.query(
            "INSERT INTO songs(title, artist, song_url, user_id) VALUES($1, $2, $3, $4) RETURNING *",
            [title, artist, song_url, user_id]
        );

        res.status(200).json({
            message: "Song uploaded successfully",
            song: result.rows[0]
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Songs Route
router.get("/", async (req, res) => {
    try {
        // Added space between * and FROM
        const result = await pool.query("SELECT * FROM songs ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ message: "Server error while fetching songs" });
    }
});

// Delete Song Route
router.delete("/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM songs WHERE id=$1", [req.params.id]);
        res.json({ message: "Song deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;