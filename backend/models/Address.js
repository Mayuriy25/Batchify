const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    addressId: {
        type: String,
        required: true
    },

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    }
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;