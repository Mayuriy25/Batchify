// Rider stores information about the delivery partner.
// Capacity tells us how many orders the rider can carry.
// Status tells us whether the rider is available for a batch.

const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
    riderId: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    capacity: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true
    }
});

const Rider = mongoose.model("Rider", riderSchema);

module.exports = Rider;