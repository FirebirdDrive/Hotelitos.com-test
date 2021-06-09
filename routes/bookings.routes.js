'use strict'

var express = require('express');
var bookingController = require('../controllers/bookings.controller');
var mdAuth = require('../middlewares/authentication');

var api = express.Router();

api.post('/:idU/setReservation/:idR/:idH', [mdAuth.ensureAuth], bookingController.setReservation);
api.put('/:idU/deleteReservation/:idB/:idR', [mdAuth.ensureAuth], bookingController.deleteReservation);
api.get('/getReservations/:id', [mdAuth.ensureAuth], bookingController.getReservations);
api.get('/getBookig/:idU', [mdAuth.ensureAuth], bookingController.getReservationsByUser);

module.exports = api;