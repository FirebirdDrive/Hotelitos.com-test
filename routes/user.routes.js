'use strict'

const userController = require('../controllers/user.controller');
const mdAuth = require('../middlewares/authentication')
const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({ uploadDir: './uploads/users' })

var express = require('express');
var api = express.Router();

/**
 * General routes
 */
api.post('/login', userController.login);
api.post('/signUp', userController.signUp);

/**
 * User routes
 */
api.put('/deleteAccount/:id', [mdAuth.ensureAuth], userController.deleteAccount);
api.post('/updateUser/:id', [mdAuth.ensureAuth], userController.updateUser);
api.put('/:id/uploadImage/', [mdAuth.ensureAuth, upload], userController.uploadImage);
api.get('/getImage/:fileName', [upload], userController.getImage);

/**
 * App administrator routes
 */
api.post('/saveHotelAdmin', [mdAuth.ensureAuth, mdAuth.ensureAuthAppAdministrator], userController.createHotelAdministrator);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.ensureAuthAppAdministrator], userController.getUsers)
api.post('/assignAdmin/:idH', [mdAuth.ensureAuth, mdAuth.ensureAuthAppAdministrator], userController.createHotelAdministrator);

/**
 *  PDF
 */

api.get('/pdfReservations/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], userController.pdfReservations);
api.get('/getUsersByHotel/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], userController.getUsersByHotel);
api.get('/getUsersByIS/:id', [mdAuth.ensureAuth], userController.getUsersByIS);
api.get('/getUsersByBookingsByHotelAdmin/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthHotelAdministrator], userController.getUsersByBookings);
api.get('/getUsersByBookingsByUser/:id', [mdAuth.ensureAuth], userController.getUsersByBookings);


module.exports = api;