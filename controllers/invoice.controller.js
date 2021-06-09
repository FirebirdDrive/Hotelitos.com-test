'use strict'

var User = require('../models/user.model');
var Invoice = require('../models/invoice.model');
var Booking = require('../models/bookings.model');
var Room = require('../models/rooms.model');
var Event = require('../models/events.model');

var total = [];

// res.send({ services: services, arr: services });
// res.send({ invoiceUpdate });

function createInvoice(req, res) {
    const invoiceId = req.params.idI;

    Invoice.findById(invoiceId, (err, invoiceFind) => {
        if (err) {
            res.status(500).send({ message: 'General error' });
        } else if (invoiceFind) {
            total = [];
            invoiceFind.services.forEach(price => {
                total.push(price);
            })
            const totalSum = sum();
            Invoice.findByIdAndUpdate({ _id: invoiceId }, { $set: { totalPrice: totalSum } }, { new: true }, (err, invoiceUpdate) => {
                if (err) {
                    res.status(500).send({ message: 'General error' });
                } else if (invoiceUpdate) {
                    let index = invoiceFind.bookings.length === 1 ? 0 : invoiceFind.bookings.length - 1;
                    let id = invoiceFind.bookings[index];
                    Booking.findById(id).exec((err, bookingFind) => {
                        if (err) {
                            res.status(500).send({ message: 'General error' });
                        } else if (bookingFind) {
                            Room.findById(bookingFind.room[0]).exec((err, roomFind) => {
                                if (err) {
                                    res.status(500).send({ message: 'General error' });
                                } else if (roomFind) {
                                    Invoice.findByIdAndUpdate(invoiceId, { $inc: { totalPrice: +roomFind.price } }, { new: true }, (err, invoiceUpdate) => {
                                        if (err) {
                                            res.status(500).send({ message: 'General Error' });
                                        } else if (invoiceUpdate) {
                                            Room.findByIdAndUpdate({ _id: bookingFind.room[0] }, { availability: "AVAILABLE" }, { new: true }, (err, roomUpdate) => {
                                                if (err) {
                                                    res.status(500).send({ message: 'General Error' });
                                                } else if (roomUpdate) {
                                                    if (invoiceUpdate.events.length === 0) {
                                                        res.send({ message: invoiceUpdate });
                                                    } else {
                                                        Event.findById(invoiceUpdate.events).exec((err, eventFind) => {
                                                            if (err) {
                                                                res.status(500).send({ message: 'General error' });
                                                            } else if (eventFind) {
                                                                Invoice.findByIdAndUpdate(invoiceId, { $inc: { totalPrice: +eventFind.price } }, { new: true }, (err, invoiceUpdate) => {
                                                                    if (err) {
                                                                        res.status(500).send({ message: 'General error' });
                                                                    } else if (invoiceUpdate) {
                                                                        var services = [];
                                                                        services = invoiceUpdate.services;
                                                                        //console.log(invoiceUpdate.events[0])
                                                                        Event.findById(invoiceUpdate.events[0]).exec((err, eventFind) => {
                                                                            if (err) {
                                                                                res.status(500).send({ message: 'Error ' });
                                                                            } else if (eventFind) {
                                                                                var event = [];
                                                                                event = eventFind;
                                                                                res.send({ message: 'Data', services: services, event: event, totalPrice: invoiceUpdate.totalPrice });
                                                                            } else {
                                                                                res.status(500).send({ message: 'Error ' });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.status(500).send({ message: 'Error ' });
                                                                    }
                                                                }).populate('services')
                                                            } else {
                                                                res.status(500).send({ message: 'Error ' });
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    res.status(500).send({ message: 'Error ' });
                                                }
                                            })
                                        } else {
                                            res.status(500).send({ message: 'Error ' });
                                        }
                                    })
                                } else {
                                    res.status(500).send({ message: 'Error ' });
                                }
                            })
                        } else {
                            res.status(500).send({ message: 'Error' });
                        }
                    })
                } else {
                    res.status(500).send({ message: 'Error' });
                }
            })
        } else {
            res.status(500).send({ message: 'Error' });
        }
    }).populate('services')
}

function sum() {
    var totalPrice = 0;
    for (var i = 0; i < total.length; i++) {
        totalPrice += total[i].price;
    }
    return totalPrice;
}

module.exports = {
    createBill: createInvoice
}