'use strict'

var User = require('../models/user.model');
var Hotel = require('../models/hotel.model');
var bcrypt = require('bcrypt-nodejs');
var validator = require('../utils/validations-helper');
var stringUtils = require('../utils/string-utils');

const HOTEL_ADMIN = "HOTEL_ADMIN";

function newHotel(req, res) {
    const hotel = new Hotel();
    const body = req.body;

    if (body.name && body.address && body.description) {
        Hotel.findOne({ name: stringUtils.capitalizeAllValue(body.name) }, (err, find) => {
            if (err) {
                res.status(500).send({ message: 'General error' });
            } else if (find) {
                res.send({ message: 'Hotel already exist!' });
            } else {
                hotel.name = stringUtils.capitalizeAllValue(body.name);
                hotel.address = stringUtils.capitalizeAllValue(body.address);
                hotel.description = stringUtils.capitalizeFirstValue(body.description);
                hotel.save((err, saveHotel) => {
                    if (err) {
                        res.status(500).send({ message: 'General error' });
                    } else if (saveHotel) {
                        res.send({ message: `Hotel ${saveHotel.name} has been added successfully!` });
                    } else {
                        res.status(500).send({ message: 'Failed to save data!' });
                    }
                });

            }
        });
    } else {
        res.send({ message: 'Please enter all the required data!' });
    }
}

function updateHotel(req, res) {
    const id = req.params.id;
    const body = req.body;

    if (body.name && body.address && body.description) {
        Hotel.findById(id).exec((err, find) => {
            if (err) {
                res.status(500).send({ message: 'Server error!' });
            } else if (find) {
                Hotel.findByIdAndUpdate({ _id: id }, {
                    name: stringUtils.capitalizeAllValue(body.name),
                    address: stringUtils.capitalizeAllValue(body.address),
                    description: stringUtils.capitalizeFirstValue(body.description)
                }, { new: true }, (err, update) => {
                    if (err) {
                        res.status(500).send({ message: 'Server error!' });
                    } else if (update) {
                        res.send({ message: `Hotel ${update.name} updated! :`, update });
                    } else {
                        res.send({ message: 'Update failed!' });
                    }
                })
            } else {
                res.send({ message: 'There are no hotel to find!' });
            }
        })
    } else {
        res.send({ message: 'Please enter all the required data!' });
    }
}

function deleteHotel(req, res) {
    const id = req.params.id;

    Hotel.findById(id).exec((err, find) => {
        if (err) {
            res.status(500).send({ message: 'Server error!' });
        } else if (find) {
            if (find.rooms.length === 0) {
                User.findOne({ hotels: id }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Server error!' });
                    } else if (userFind) {
                        User.findOneAndUpdate({ _id: userFind._id, hotels: id },
                            { $pull: { hotels: id } }, { new: true }, (err, hotelPull) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error general' });
                                } else if (hotelPull) {
                                    Hotel.findByIdAndRemove(id, (err, hotelRemoved) => {
                                        if (err) {
                                            res.status(500).send({ message: 'Server error!' });
                                        } else if (hotelRemoved) {
                                            res.send({ message: `Hotel ${hotelRemoved.name} deleted` });
                                        } else {
                                            res.send({ message: 'Removed failed, hotel does not exist' });
                                        }
                                    })
                                } else {
                                    res.status(500).send({ message: 'No se pudo eliminar el contacto del usuario' });
                                }
                            })
                    } else {
                        res.send({ message: 'Find failed' });
                    }
                })
            } else {
                res.status(500).send({ message: 'You cannot delete a hotel that has reservations!' });
            }
        } else {
            res.send({ message: 'Find failed, hotel does not exist' });
        }
    })
}

function getHotels(req, res) {
    Hotel.find({}).exec((err, hotels) => {
        if (err) {
            res.status(500).send({ message: 'Server error trying to search!' })
        } else if (hotels) {
            res.send({ message: 'Hotel found:', hotels: hotels })
        } else {
            res.send({ message: 'There are no records!' })
        }
    })
}

function getHotelName(req, res) {
    const id = req.params.id;

    Hotel.findById(id).exec((err, hotel) => {
        if (err) {
            res.status(500).send({ message: 'Server error trying to search!' })
        } else if (hotel) {
            res.send({ message: 'Hotel found:', hotel: hotel })
        } else {
            res.send({ message: 'There are no records!' })
        }
    })
}

function getMostPopularHotel(req, res) {
    Hotel.find({}).sort({ popular: -1 }).limit(1).exec((err, hotels) => {
        if (err) {
            res.status(500).send({ message: 'Server error trying to search!' });
        } else if (hotels) {
            res.send({ hotels: hotels });
            //hotels[0].popular
        } else {
            res.send({ message: 'There are no hotel!' });
        }
    })
}

module.exports = {
    getHotels,
    newHotel,
    updateHotel,
    deleteHotel,
    getHotelName,
    getMostPopularHotel
}
