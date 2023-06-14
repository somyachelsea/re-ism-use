const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    category: String,
    userId: String,
    company: String
})

const User = mongoose.model("Product", productSchema);

module.exports = User;