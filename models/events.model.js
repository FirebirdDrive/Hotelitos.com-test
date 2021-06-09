'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = Schema({
    name: String,
    description: String,
    price: Number,
    type: String,
})

module.exports = mongoose.model('event', eventSchema);