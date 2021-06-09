'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hotelSchema = Schema({
    name: String,
    address: String,
    description: String,
    popular: { type: Number, default: 0 },
    services: [{ type: Schema.ObjectId, ref: 'service' }],
    events: [{ type: Schema.ObjectId, ref: 'event' }],
    rooms: [{ type: Schema.ObjectId, ref: 'room' }]
});

module.exports = mongoose.model('hotel', hotelSchema);