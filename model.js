const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({

    code: String,

    name: String,

    open: String,

    yestclose: Number,

    price: Number,

    low: Number,

    high: Number,

    volume: Number,

    amount: Number,
    date: String,
    time: String,

    percent: String,

});

module.exports = mongoose.model('Stocks', stockSchema);