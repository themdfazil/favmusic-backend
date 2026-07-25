require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const users = require("./routes/users");
const songsRouter = require("./routes/songs")

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("backend running");
});

app.use("/api/users", require("./routes/users"));
app.use("/api/songs", require("./routes/songs"));


const PORT = 5000

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});