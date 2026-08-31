const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Batchify 🚚"
    });
});

app.listen(PORT, () => {
    console.log(`Batchify server is running on port ${PORT}`);
});