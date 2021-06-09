'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceSchema = Schema({
    bookings: [{ type: Schema.ObjectId, ref: 'booking' }],
    services: [{ type: Schema.ObjectId, ref: 'service' }],

    events: [{ type: Schema.ObjectId, ref: 'event' }],
    totalPrice: { type: Number, default: 0 },
})

module.exports = mongoose.model('invoice', invoiceSchema);