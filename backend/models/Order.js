const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    customerId: {
        type: String,
        required: true,
    },
    addressId: {
        type: String,
        required: true
    },
    orderTime:{
        type:Date,
        required:true
    },
    promisedDeliveryTime:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        required:true,
    },
    batchId:{
        type:String,
        default:null
    }
})

const Order=mongoose.model("Order",orderSchema)
module.exports=Order;


