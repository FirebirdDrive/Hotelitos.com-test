'use Strict'

const express = require('express');
const eventsController = require('../controllers/events.controller');
const mdAuth = require('../middlewares/authentication');

var api = express.Router();

api.post('/createEvent/:idH', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], eventsController.createEvent);
api.put('/updateEvent/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], eventsController.updateEvent);
api.get('/getEvents', [mdAuth.ensureAuth], eventsController.getEvents);
api.put('/:idH/removeEvent/:idE', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], eventsController.removeEvent);
api.get('/searchEvent', [mdAuth.ensureAuth], eventsController.searchEvent);

api.put('/:idE/selectEvent/:idU', [mdAuth.ensureAuth], eventsController.selectEvent);


module.exports = api