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

const BaseSchema = new mongoose.Schema({
    name: String,
    value: String,
    type: String,
})

module.exports = {
    Stocks: mongoose.model('Stocks', stockSchema),
    tempStocks: mongoose.model('tempStocks', stockSchema),
    BaseSchema: mongoose.model('stockList', BaseSchema),
} 