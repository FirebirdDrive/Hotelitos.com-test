'use Strict'

const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
var mdAuth = require('../middlewares/authentication');

var api = express.Router();

api.get('/getInvoice/:idI', [mdAuth.ensureAuth], invoiceController.createBill);

module.exports = api