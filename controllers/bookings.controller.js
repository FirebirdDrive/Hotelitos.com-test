'use strict'
// console.log(new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0])
var Room = require('../models/rooms.model');
var Booking = require('../models/bookings.model');
var Hotel = require('../models/hotel.model');
var User = require('../models/user.model');
var Invoice = require('../models/invoice.model');

const today = new Date()
const tomorrow = new Date(today)

function setReservation(req, res) {
    var booking = new Booking();
    var invoice = new Invoice();
    var roomId = req.params.idR;
    var userId = req.params.idU;
    var hotelId = req.params.idH;

    User.findById(userId, (err, userReserved) => {
        var id = userReserved.bookings.length === 0 ? 0 : userReserved.bookings.length - 1;
        console.log('Id ' + userReserved.bookings[id])
        console.log('Date ' + new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0])
        console.log('UserFind' + userReserved)
        if (err) {
            return res.status(404).send({ message: "Error finding the user" })
        } else if (userReserved) {
            if (userReserved.bookings.length === 0) {
                Room.findById(roomId, (err, roomFind) => {
                    if (err) {
                        res.status(404).send({ message: "Error while searching the room" })
                    } else if (roomFind) {
                        if (roomFind.availability == "UNAVAILABLE") {
                            return res.status(404).send({ message: "This room was already reserved!" })
                        } else {
                            Room.findByIdAndUpdate({ _id: roomId }, { availability: "UNAVAILABLE" }, { new: true }, (err, roomUpdate) => {
                                if (err) {
                                    return res.status(404).send({ message: "Error in the room data" })
                                } else if (roomUpdate) {
                                    booking.endDate = tomorrow.setDate(tomorrow.getDate() + 1);
                                    booking.save((err, bookingSaved) => {
                                        if (err) {
                                            return res.status(404).send({ message: "General error in the booking" })
                                        } else if (bookingSaved) {
                                            User.findByIdAndUpdate(userId, { $push: { bookings: bookingSaved._id } }, { new: true }, (err, userUpdate) => {
                                                if (err) {
                                                    return res.status(404).send({ message: "Error in the user admin hotel" })
                                                } else if (userUpdate) {
                                                    User.findOne({ hotels: hotelId }, (err, userHotelFind) => {
                                                        if (err) {
                                                            return res.status(404).send({ message: "Error in the user admin hotel" })
                                                        } else if (userHotelFind) {
                                                            User.findByIdAndUpdate(userHotelFind._id, { $push: { bookings: bookingSaved._id } }, { new: true }, (err, userHotelUpdate) => {
                                                                if (err) {
                                                                    return res.status(404).send({ message: "Error in user find hotel admin" })
                                                                } else if (userHotelUpdate) {
                                                                    Booking.findByIdAndUpdate(bookingSaved._id, { $push: { room: roomUpdate._id } }, { new: true }, (err, bookingUpdate) => {
                                                                        if (err) {
                                                                            return res.status(404).send({ message: "Error in the reservation" })
                                                                        } else if (bookingUpdate) {
                                                                            Hotel.findByIdAndUpdate(hotelId, { $inc: { popular: +1 } }, { new: true }, (err, hotelUpdate) => {
                                                                                if (err) {
                                                                                    return res.status(404).send({ message: "Error in the reservation" })
                                                                                } else if (hotelUpdate) {
                                                                                    invoice.bookings = bookingSaved._id;
                                                                                    invoice.save((err, invoiceSaved) => {
                                                                                        if (err) {
                                                                                            return res.status(404).send({ message: "Error in the invoice" })
                                                                                        } else if (invoiceSaved) {
                                                                                            User.findByIdAndUpdate(userId, { $push: { invoices: invoiceSaved._id } }, { new: true }, (err, userUpdated) => {
                                                                                                if (err) {
                                                                                                    return res.status(404).send({ message: "Error in the user update" })
                                                                                                } else if (userUpdated) {
                                                                                                    User.findByIdAndUpdate(userHotelFind._id, { $push: { invoices: invoiceSaved._id } }, { new: true }, (err, userUpdatedAdminHotel) => {
                                                                                                        if (err) {
                                                                                                            return res.status(404).send({ message: "Error in the user admin hotel" })
                                                                                                        } else if (userUpdatedAdminHotel) {
                                                                                                            return res.status(404).send({ message: "Reservation created", bookingSaved })
                                                                                                        } else {
                                                                                                            return res.status(404).send({ message: "Error while updating the user admin hotel" })
                                                                                                        }
                                                                                                    })
                                                                                                } else {
                                                                                                    return res.status(404).send({ message: "Error in the user" })
                                                                                                }
                                                                                            })
                                                                                        } else {
                                                                                            return res.status(404).send({ message: "Error while trying to save the invoice" })
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    return res.status(404).send({ message: "Error while trying to save the reservation" })
                                                                                }
                                                                            })
                                                                        } else {
                                                                            return res.status(404).send({ message: "Error while trying to save the reservation" })
                                                                        }
                                                                    })
                                                                } else {
                                                                    return res.status(404).send({ message: "Error while trying to update the hotel" })
                                                                }
                                                            })
                                                        } else {
                                                            return res.status(404).send({ message: "Error in the user admin hotel find" })
                                                        }
                                                    })
                                                } else {
                                                    return res.status(404).send({ message: "Error while trying to update the user" })
                                                }
                                            })
                                        } else {
                                            return res.status(404).send({ message: "Error while saving the reservaiton" })
                                        }
                                    })
                                } else {
                                    return res.status(404).send({ message: "Error while updating the hotel" })
                                }
                            })
                        }
                    } else {
                        return res.status(500).send({ message: "There is no room!" })
                    }
                })
            } else {
                var id = userReserved.bookings.length === 0 ? 0 : userReserved.bookings.length - 1;
                console.log('id 2 ' + id)
                Booking.findById(userReserved.bookings[id], (err, bookingFind) => {
                    if (err) {
                        res.status(404).send({ message: "General error" })
                    } else if (bookingFind) {
                        console.log('Booking date:' + bookingFind.endDate);
                        console.log('Date' + new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0]);

                        const date = new Date();
                        console.log('Date' + date);

                        //date.toString() > bookingFind.endDate
                        if (date > bookingFind.endDate) {
                            Room.findById(roomId, (err, roomFind) => {
                                if (err) {
                                    res.status(404).send({ message: "Error while searching the room" })
                                } else if (roomFind) {
                                    if (roomFind.availability == "UNAVAILABLE") {
                                        return res.status(404).send({ message: "This room was already reserved!" })
                                    } else {
                                        Room.findByIdAndUpdate({ _id: roomId }, { availability: "UNAVAILABLE" }, { new: true }, (err, roomUpdate) => {
                                            if (err) {
                                                return res.status(404).send({ message: "Error in the room data" })
                                            } else if (roomUpdate) {
                                                booking.endDate = tomorrow.setDate(tomorrow.getDate() + 1);
                                                booking.save((err, bookingSaved) => {
                                                    if (err) {
                                                        return res.status(404).send({ message: "General error in the booking" })
                                                    } else if (bookingSaved) {
                                                        User.findByIdAndUpdate(userId, { $push: { bookings: bookingSaved._id } }, { new: true }, (err, userUpdate) => {
                                                            if (err) {
                                                                return res.status(404).send({ message: "Error in the user admin hotel" })
                                                            } else if (userUpdate) {
                                                                User.findOne({ hotels: hotelId }, (err, userHotelFind) => {
                                                                    if (err) {
                                                                        return res.status(404).send({ message: "Error in the user admin hotel" })
                                                                    } else if (userHotelFind) {
                                                                        User.findByIdAndUpdate(userHotelFind._id, { $push: { bookings: bookingSaved._id } }, { new: true }, (err, userHotelUpdate) => {
                                                                            if (err) {
                                                                                return res.status(404).send({ message: "Error in user find hotel admin" })
                                                                            } else if (userHotelUpdate) {
                                                                                Booking.findByIdAndUpdate(bookingSaved._id, { $push: { room: roomUpdate._id } }, { new: true }, (err, bookingUpdate) => {
                                                                                    if (err) {
                                                                                        return res.status(404).send({ message: "Error in the reservation" })
                                                                                    } else if (bookingUpdate) {
                                                                                        Hotel.findByIdAndUpdate(hotelId, { $inc: { popular: +1 } }, { new: true }, (err, hotelUpdate) => {
                                                                                            if (err) {
                                                                                                return res.status(404).send({ message: "Error in the reservation" })
                                                                                            } else if (hotelUpdate) {
                                                                                                invoice.bookings = bookingSaved._id;
                                                                                                invoice.save((err, invoiceSaved) => {
                                                                                                    if (err) {
                                                                                                        return res.status(404).send({ message: "Error in the invoice" })
                                                                                                    } else if (invoiceSaved) {
                                                                                                        User.findByIdAndUpdate(userId, { $push: { invoices: invoiceSaved._id } }, { new: true }, (err, userUpdated) => {
                                                                                                            if (err) {
                                                                                                                return res.status(404).send({ message: "Error in the user update" })
                                                                                                            } else if (userUpdated) {
                                                                                                                User.findByIdAndUpdate(userHotelFind._id, { $push: { invoices: invoiceSaved._id } }, { new: true }, (err, userUpdatedAdminHotel) => {
                                                                                                                    if (err) {
                                                                                                                        return res.status(404).send({ message: "Error in the user admin hotel" })
                                                                                                                    } else if (userUpdatedAdminHotel) {
                                                                                                                        return res.status(404).send({ message: "Reservation created", bookingSaved })
                                                                                                                    } else {
                                                                                                                        return res.status(404).send({ message: "Error while updating the user admin hotel" })
                                                                                                                    }
                                                                                                                })
                                                                                                            } else {
                                                                                                                return res.status(404).send({ message: "Error in the user" })
                                                                                                            }
                                                                                                        })
                                                                                                    } else {
                                                                                                        return res.status(404).send({ message: "Error while trying to save the invoice" })
                                                                                                    }
                                                                                                })
                                                                                            } else {
                                                                                                return res.status(404).send({ message: "Error while trying to save the reservation" })
                                                                                            }
                                                                                        })
                                                                                    } else {
                                                                                        return res.status(404).send({ message: "Error while trying to save the reservation" })
                                                                                    }
                                                                                })
                                                                            } else {
                                                                                return res.status(404).send({ message: "Error while trying to update the hotel" })
                                                                            }
                                                                        })
                                                                    } else {
                                                                        return res.status(404).send({ message: "Error in the user admin hotel find" })
                                                                    }
                                                                })
                                                            } else {
                                                                return res.status(404).send({ message: "Error while trying to update the user" })
                                                            }
                                                        })
                                                    } else {
                                                        return res.status(404).send({ message: "Error while saving the reservaiton" })
                                                    }
                                                })
                                            } else {
                                                return res.status(404).send({ message: "Error while updating the hotel" })
                                            }
                                        })
                                    }
                                } else {
                                    return res.status(500).send({ message: "There is no room!" })
                                }
                            })
                        } else {
                            return res.status(404).send({ message: "You already reserved a room!" })
                        }
                    } else {
                        res.status(404).send({ message: "General error" })
                    }

                })
            }
        } else {
            return res.status(404).send({ message: "General error in the user" })
        }
    })
}


function deleteReservation(req, res) {
    let bookingId = req.params.idB;
    let roomId = req.params.idR;
    let userId = req.params.idU;

    Room.findById(roomId, (err, roomFind) => {
        if (err) {
            return res.status(404).send({ message: "General error while searching the room!" })
        } else if (roomFind) {
            Room.findByIdAndUpdate({ _id: roomId }, { availability: "AVAILABLE" }, { new: true }, (err, roomUpdate) => {
                if (err) {
                    return res.status(500).send({ message: 'General error in the room' });
                } else if (roomUpdate) {
                    User.findByIdAndUpdate({ _id: userId, bookings: bookingId }, { $pull: { bookings: bookingId } }, { new: true }, (err, userPull) => {
                        if (err) {
                            return res.status(500).send({ message: 'General error in the reservation' });
                        } else if (userPull) {
                            Booking.findByIdAndDelete(bookingId, (err, bookingRemoved) => {
                                if (err) {
                                    return res.status(404).send({ message: "Error while trying to delete" })
                                } else if (bookingRemoved) {
                                    return res.send({ message: 'Reservation deleted', bookingRemoved });
                                } else {
                                    return res.status(404).send({ message: "This reservation doesnt exist or it was already deleted" })
                                }
                            })
                        } else {
                            return res.status(404).send({ message: "This reservation doesnt exists or it is already deleted" })
                        }
                    })
                } else {
                    return res.status(500).send({ message: 'The room cannot be updated' });
                }
            })
        }
    })
}

function getReservations(req, res) {
    let bookingId = req.params.id;

    Booking.findById(bookingId, (err, bookings) => {
        if (err) {
            res.status(500).send({ message: "Server error while searching" })
        } else if (bookings) {
            res.status(200).send({ message: "Booking found:", bookings })
        } else {
            res.status(200).send({ message: "There is no data" })
        }
    })
}

function getReservationsByUser(req, res) {
    let userId = req.params.idU;

    User.findById(userId, (err, user) => {
        if (err) {
            res.status(500).send({ message: "Server error while searching" })
        } else if (user) {
            res.status(200).send({ user: user })
        } else {
            res.status(200).send({ message: "There is no data" })
        }
    })
}

module.exports = {
    setReservation,
    deleteReservation,
    getReservations,
    getReservationsByUser
}