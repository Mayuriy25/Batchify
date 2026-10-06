const mongoose = require("mongoose");

// Batch groups compatible orders for one rider.
// We store order IDs instead of full orders to avoid duplication.
const batchSchema = new mongoose.Schema({
    batchId: {
        type: String,
        required: true
    },

    orderIds: {
        type: [String],
        required: true
    },

    riderId: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        required: true
    }
});

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;