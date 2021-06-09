'use strict'

var serviceRoutes = require('./routes/services.routes');
var eventRoutes = require('./routes/events.routes');
var roomRoutes = require('./routes/rooms.routes');
var bookingRoutes = require('./routes/bookings.routes');
var userRoutes = require('./routes/user.routes');
var hotelRoutes = require('./routes/hotel.routes');
var invoiceRoutes = require('./routes/invoices.routes');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();


app.use(bodyParser.urlencoded({ extended: false })) // Codificacion de URL
app.use(bodyParser.json()); // El dato que venga lo convierte a JSON

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(cors());

app.use('/v1', serviceRoutes);
app.use('/v1', eventRoutes);
app.use('/v1', roomRoutes);
app.use('/v1', bookingRoutes);
app.use('/v1', userRoutes);
app.use('/v1', hotelRoutes);
app.use('/v1', invoiceRoutes);

module.exports = app;