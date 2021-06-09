'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
    email: String,
    image: String,
    role: String,
    invoices: [{ type: Schema.ObjectId, ref: 'invoice' }],
    hotels: [{ type: Schema.ObjectId, ref: 'hotel' }],
    bookings: [{ type: Schema.ObjectId, ref: 'booking' }]
});

module.exports = mongoose.model('user', userSchema);