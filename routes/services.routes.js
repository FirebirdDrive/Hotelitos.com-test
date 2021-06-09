'use Strict'

const express = require('express');
const servicesController = require('../controllers/services.controller')
const mdAuth = require('../middlewares/authentication')

var api = express.Router();

api.post('/createService/:idH', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator],servicesController.createService);
api.put('/updateService/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], servicesController.updateService);
api.get('/getServices', [mdAuth.ensureAuth], servicesController.getServices);
api.put('/:idH/removeService/:idS', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], servicesController.removeService);
api.put('/:idS/selectService/:idU', [mdAuth.ensureAuth], servicesController.selectService);

module.exports = api