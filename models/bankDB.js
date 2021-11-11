const mongoose = require('mongoose');
const secrets = require(__dirname+'/secrets.js');
const username = secrets.username;
const password = secrets.password;
const address = secrets.address;

mongoose.connect(`mongodb+srv://${username}:${password}@${address}`);

const customerSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    email: String,
    accountBalance: {
        type: Number,
        min: 0
    }
})

const transferSchema = new mongoose.Schema({
    _id: Number,
    transferredFrom: String,
    transferredTo: String,
    amount: {
        type: Number,
        min: 0
    },
    date: String
})

const Customer = mongoose.model("Customer", customerSchema);
const Transfer = mongoose.model("Transfer", transferSchema);

module.exports = {Customer,Transfer};