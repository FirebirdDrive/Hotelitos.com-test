'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var serviceSchema = Schema({
    description: String,
    price: Number,
})

module.exports = mongoose.model('service', serviceSchema);