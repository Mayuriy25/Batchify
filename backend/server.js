const dns = require("dns");
dns.setServers(["8.8.8.8"])

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const Order = require("./models/Order")

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Batchify 🚚"
    });
});

app.post("/test-order", async (req, res) => {
    const order = new Order({
        orderId: "ORD001",
        customerId: "CUST001",
        addressId: "ADDR001",
        orderTime: new Date(),
        promisedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000),
        status: "pending"
    })
    await order.save();

    res.json(order)
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

  
app.listen(PORT, () => {
    console.log(`Batchify server is running on port ${PORT}`);
});