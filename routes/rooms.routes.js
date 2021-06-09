'use Strict'

const express = require('express');
const roomsController = require('../controllers/rooms.controller');
var mdAuth = require('../middlewares/authentication');

var api = express.Router();

api.post('/createRoom/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator],roomsController.createRoom);
api.put('/updateRoom/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], roomsController.updateRoom);

api.get('/getRooms/:idH', [mdAuth.ensureAuth],roomsController.getRooms);
api.put('/:idR/removeRoom/:idH', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator],roomsController.removeRoom);
api.get('/searchRoom/', [mdAuth.ensureAuth], roomsController.searchRoom);

module.exports = api