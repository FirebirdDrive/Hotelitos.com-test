'use strict'

var Room = require('../models/rooms.model');
var capitalize = require("../utils/string-utils");
var Bookings = require('../models/bookings.model');
var Hotel = require('../models/hotel.model');

function createRoom(req, res) {
    var room = new Room();
    var params = req.body;
    var hotelId = req.params.id;

    if (params.name && params.description && params.price) {
        Hotel.findById(hotelId, (err, findHotel) => {
            if (err) {
                return res.status(404).send({ message: "General error while searching the hotel." })
            } else if (findHotel) {
                room.name = capitalize.capitalizeFirstValue(params.name);
                room.description = capitalize.capitalizeFirstValue(params.description);
                room.availability = "AVAILABLE";
                room.price = params.price;
                if (params.price <= 0) {
                    return res.status(404).send({ message: "You cant put a negative value to the price!" })
                }
                room.save((err, roomSaved) => {
                    if (err) {
                        res.status(404).send({ message: "Error while saving the data" })
                    } else if (roomSaved) {
                        Hotel.findByIdAndUpdate(findHotel._id, { $push: { rooms: roomSaved._id } }, { new: true }, (err, hotelUpdate) => {
                            if (err) {
                                return res.status(404).send({ message: "Error while creating the room" })
                            } else if (hotelUpdate) {
                                return res.send({ message: "Room created", roomSaved })
                            } else {
                                return res.status(404).send({ message: "Error in update the hotel" })
                            }
                        })
                    } else {
                        res.status(404).send({ message: "Error while saving the room" })
                    }
                })
            } else {
                return res.status(404).send({ message: "There is no hotel!." })
            }
        })
    } else {
        res.status(200).send({ message: "Please type all the fields required " })
    }
}

function updateRoom(req, res) {
    let roomId = req.params.id;
    let update = req.body;

    if (update.name == "" || update.description == "" || update.price == "" || update.price <= 0) {
        return res.status(401).send({ message: 'You cant put the description and price field in blank' });
    }
    Room.findByIdAndUpdate({ _id: roomId }, {
        name: capitalize.capitalizeFirstValue(update.name),
        description: capitalize.capitalizeFirstValue(update.description),
        price: update.price
    }, { new: true }, (err, roomUpdated) => {
        if (err) {
            return res.status(500).send({ message: 'Error while updating the room' });
        } else if (roomUpdated) {
            return res.send({ message: 'Room updated', roomUpdated });
        } else {
            return res.send({ message: 'The room could not be updated' });
        }
    })
}

function getRooms(req, res) {
    let hotelId = req.params.idH;

    Hotel.findById(hotelId, (err, hotelFind) => {
        if (err) {
            return res.status(404).send({ message: "General error while searching the hotel." })
        } else if (hotelFind) {
            return res.send({ message: "Habitaciones encontradas", room: hotelFind.rooms })
        } else {
            return res.status(404).send({ message: "General error" })
        }
    }).populate('rooms');
}

function removeRoom(req, res) {
    let roomId = req.params.idR;
    let hotelId = req.params.idH;

    Room.findOne({ _id: roomId }, (err, roomFind) => {
        if (err) {
            return res.status(404).send({ message: "General error while trying to search the room" })
        } else if (roomFind) {
            if (roomFind.availability == "UNAVAILABLE") {
                return res.status(404).send({ message: "You cant deleted this room because it is reserved" })
            } else {
                Hotel.findByIdAndUpdate(hotelId, { $pull: { rooms: roomFind._id } }, { new: true }, (err, hotelUpdate) => {
                    if (err) {
                        return res.status(404).send({ message: "General error while trying to search the hotel" })
                    } else if (hotelUpdate) {
                        Room.findByIdAndDelete(roomId, (err, roomRemoved) => {
                            if (err) {
                                return res.status(404).send({ message: "General error while trying to delete the room" })
                            } else if (roomRemoved) {
                                return res.send({ message: 'Room deleted', roomRemoved });
                            } else {
                                return res.status(404).send({ message: "This room doesnt exists or its already deleted" })
                            }
                        })
                    } else {
                        return res.status(404).send({ message: "This hotel doesnt exists!" })
                    }
                })
            }
        } else {
            return res.status(404).send({ message: "This room doesnt exists!" })
        }
    })
}

function searchRoom(req, res) {
    var params = req.body;

    if (params.search) {
        Room.find({ $or: [{ name: capitalize.capitalizeFirstValue(params.search) },] }, (err, resultSearch) => {
            if (err) {
                console.log(err)
                return res.status(500).send({ message: 'General error' });
            } else if (resultSearch) {
                return res.send({ message: 'Rooms found: ', resultSearch });
            } else {
                return res.status(403).send({ message: 'Search without coincidences' });
            }
        })
    } else {
        return res.status(403).send({ message: 'Type the name in the search bar' });
    }
}

module.exports = {
    createRoom,
    updateRoom,
    getRooms,
    removeRoom,
    searchRoom
}