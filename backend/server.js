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
    canBatchOrders,
    isBatchWindowExpired
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

    // Find possible batching candidates
    // We only consider orders from the same customer,
    // same address, and orders that are not dispatched.
    const existingOrders = await Order.find({
        customerId: order.customerId,
        addressId: order.addressId,
        status: { $ne: "dispatched" },
        _id: { $ne: order._id }
    });

    console.log(existingOrders);

    // Find an available rider
    const rider = await Rider.findOne({
        status: "available"
    });

    const batch = await Batch.findOne({
        riderId: rider.riderId,
        status: "pending"
    });

    const windowExpired = batch
        ? isBatchWindowExpired(batch)
        : false;

    console.log("Batch window expired:", windowExpired);

    console.log(
        "Existing batch:",
        batch ? batch.batchId : "No batch"
    );
    const currentOrderCount = batch
        ? batch.orderIds.length
        : 0;

    console.log("Current order count:", currentOrderCount);

    console.log(rider);

    // Check whether the new order can be batched with an existing order
    let canBatch = false;

    for (const existingOrder of existingOrders) {
        const result = canBatchOrders(
            order,
            existingOrder,
            rider,
            currentOrderCount,
            new Date(Date.now() + 30 * 60 * 1000)
        );

        console.log("Can batch with order", existingOrder.orderId, ":", result);

        if (result && !windowExpired) {
            canBatch = true;

            // Add the new order to the existing batch
            const updatedBatch = await Batch.findOneAndUpdate(
                { batchId: batch.batchId },
                { $push: { orderIds: order.orderId } },
                { returnDocument: "after" }
            );

            console.log("Updated batch:", updatedBatch);

            break;
        }
    }


    console.log("Can batch:", canBatch);

    if (!canBatch) {

        const newBatch = new Batch({
            batchId: "B002",
            orderIds: [order.orderId],
            riderId: rider.riderId,
            createdAt: new Date(),
            status: "pending"
        });

        await newBatch.save();

        // Update the order with the batch it belongs to
        order.batchId = newBatch.batchId;
        await order.save();

        console.log("New batch created:", newBatch);
        console.log("Updated order:", order);
    }

    res.json(order);
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