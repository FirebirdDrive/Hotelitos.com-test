'use strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var bookingSchema = Schema({
    room: [{ type: Schema.ObjectId, ref: 'room' }],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date }
})

module.exports = mongoose.model('booking', bookingSchema);