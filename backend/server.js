const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Import Order model
// Used to create and work with order data in MongoDB
const Order = require("./models/Order");

// Import Address model
// Used to create and work with address data in MongoDB
const Address = require("./models/Address");

// Import Rider model
// Used to create and work with rider data in MongoDB
const Rider = require("./models/Rider");

// Import Batch model
// Used to create and work with batch data in MongoDB
const Batch = require("./models/Batch");


// Import batching service
// Used to check whether orders can be batched.
const {
    canBatchOrders
} = require("./Services/batchingService")

const app = express();
app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Batchify 🚚"
    });
});

// Create a new order
app.post("/orders", async (req, res) => {
    const { orderId, customerId, addressId } = req.body;

    const order = new Order({
        orderId: orderId,
        customerId: customerId,
        addressId: addressId,
        orderTime: new Date(),
        promisedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000),
        status: "pending"
    });

    await order.save();

    // Find existing orders from MongoDB
    const existingOrders = await Order.find({
        _id: { $ne: order._id }
    });

    console.log(existingOrders);

    res.json(order);

    // Find an available rider
    const rider = await Rider.findOne({
        status: "available"
    });

    console.log(rider);

    // Check whether the new order can be batched with an existing order
    const canBatch = canBatchOrders(
        order,
        existingOrders[0],
        rider,
        0,
        new Date(Date.now() + 30 * 60 * 1000)
    );

    console.log("Can batch:", canBatch);
});

// Create a new address
// Order stores which address it belongs to.
// Address stores the actual location details.
app.post("/addresses", async (req, res) => {
    const { addressId, latitude, longitude } = req.body;

    const address = new Address({
        addressId: addressId,
        latitude: latitude,
        longitude: longitude
    });

    await address.save();

    res.json(address);
});

// Create a new rider
// Receives rider details and saves them in MongoDB.
app.post("/riders", async (req, res) => {
    const { riderId, name, capacity, status } = req.body;

    const rider = new Rider({
        riderId: riderId,
        name: name,
        capacity: capacity,
        status: status
    });

    await rider.save();

    res.json(rider);
});


// Create a new batch
// Groups orders together and assigns them to a rider
app.post("/batches", async (req, res) => {
    const { batchId, orderIds, riderId, status } = req.body;

    const batch = new Batch({
        batchId: batchId,
        orderIds: orderIds,
        riderId: riderId,
        createdAt: new Date(),
        status: status
    });

    await batch.save();

    res.json(batch);
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