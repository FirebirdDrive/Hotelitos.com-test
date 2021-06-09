'use strict'

const hotelController = require('../controllers/hotel.controller');
const mdAuth = require('../middlewares/authentication')

var express = require('express');
var api = express.Router();

api.post('/newHotel', [mdAuth.ensureAuth, mdAuth.ensureAuthAppAdministrator], hotelController.newHotel);
api.post('/updateHotel/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAppAdministrator], hotelController.updateHotel);
api.put('/deleteHotel/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAppAdministrator], hotelController.deleteHotel);
api.get('/getHotels', [mdAuth.ensureAuth, mdAuth.ensureAuthAppAdministrator], hotelController.getHotels);
api.get('/showHotels', hotelController.getHotels);
api.get('/getMostPopularHotel', hotelController.getMostPopularHotel);
api.get('/getHotelName/:id', hotelController.getHotelName);

module.exports = api;