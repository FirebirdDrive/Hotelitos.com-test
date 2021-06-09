'use strict'

var Event = require('../models/events.model');
var capitalize = require("../utils/string-utils");
var Hotel = require('../models/hotel.model');
var Invoice = require('../models/invoice.model');
var User = require('../models/user.model');

function createEvent(req, res) {
    const idHotel = req.params.idH;
    var event = new Event();
    var params = req.body;

    if (params.name && params.description && params.price && params.type) {
        Hotel.findById(idHotel, (err, findHotel) => {
            if (err) {
                return res.status(404).send({ message: "General error while searching the hotel." })
            } else if (findHotel) {
                Event.findOne({ name: capitalize.capitalizeFirstValue(params.name) }, (err, eventFind) => {
                    if (err) {
                        res.status(500).send({ message: "Error while trying to search the event" })
                    } else if (eventFind) {
                        res.status(200).send({ message: "This event was already made!" })
                    } else {
                        event.name = capitalize.capitalizeFirstValue(params.name);
                        event.description = capitalize.capitalizeFirstValue(params.description);
                        event.price = params.price;
                        event.type = capitalize.capitalizeFirstValue(params.type);
                        if (params.price == "" || params.price < 0) {
                            return res.status(404).send({ message: "You cant put a negative value or a blank value to the price" })
                        }
                        event.save((err, eventSaved) => {
                            if (err) {
                                res.status(404).send({ message: "Error while saving the data" })
                            } else if (eventSaved) {
                                Hotel.findByIdAndUpdate(findHotel._id, { $push: { events: eventSaved._id } }, { new: true }, (err, hotelUpdate) => {
                                    if (err) {
                                        return res.status(404).send({ message: "Error while saving the event" })
                                    } else if (hotelUpdate) {
                                        return res.send({ message: "Event created", hotelUpdate })
                                    } else {
                                        return res.status(404).send({ message: "Error while trying to update the hotel" })
                                    }
                                })
                            } else {
                                res.status(404).send({ message: "General error" })
                            }
                        })
                    }
                })
            } else {
                return res.status(404).send({ message: "There is no hotel!." })
            }
        })
    } else {
        res.status(200).send({ message: "Please type all the fields required" })
    }
}
function updateEvent(req, res) {
    let eventId = req.params.id;
    let update = req.body;

    if (update.name == "" || update.price == "" || update.price < 0 || update.description == "" || update.type == "") {
        return res.status(401).send({ message: 'You cant put a negative value to the price or blank space to the fields' });
    }
    // Event.findOne({
    //     name: capitalize.capitalizeFirstValue(update.name),
    //     description: capitalize.capitalizeFirstValue(update.description),
    //     price: update.price,
    //     type: capitalize.capitalizeFirstValue(update.type)
    // }, (err, eventFind) => {
    //     if (err) {
    //         return res.status(500).send({ message: 'General error while searching the event' });
    //     } else if (eventFind) {
    //         return res.send({ message: 'The name of the event is already in use, change it' });
    //     } else {
    Event.findByIdAndUpdate({ _id: eventId }, {
        name: capitalize.capitalizeFirstValue(update.name),
        description: capitalize.capitalizeFirstValue(update.description),
        price: update.price,
        type: capitalize.capitalizeFirstValue(update.type)
    }, { new: true }, (err, eventUpdated) => {
        if (err) {
            return res.status(500).send({ message: 'Error general al actualizar' });
        } else if (eventUpdated) {
            return res.send({ message: 'Events updated', eventUpdated });
        } else {
            return res.send({ message: 'The event could not be updated' });
        }
    })
    //     }
    // })
}


function getEvents(req, res) {
    Event.find({}).exec((err, events) => {
        if (err) {
            res.status(500).send({ message: "Error while trying to search" })
        } else if (events) {
            res.status(200).send({ message: "Events found:", events })
        } else {
            res.status(200).send({ message: "There is no data" })
        }
    })
}

function removeEvent(req, res) {
    let hotelId = req.params.idH
    let eventId = req.params.idE;

    Hotel.findByIdAndUpdate({ _id: hotelId, events: eventId }, { $pull: { events: eventId } }, { new: true }, (err, eventPull) => {
        if (err) {
            return res.status(500).send({ message: 'General error' });
        } else if (eventPull) {
            Event.findByIdAndRemove(eventId, (err, eventRemoved) => {
                if (err) {
                    return res.status(404).send({ message: "General error while trying to delete the event" })
                } else if (eventRemoved) {
                    return res.send({ message: 'Event deleted', eventPull });
                } else {
                    return res.status(404).send({ message: "The event doesnt exist or is already deleted" })
                }
            })
        } else {
            return res.status(500).send({ message: 'The event could not be deleted from the hotel' });
        }
    }).populate('event')
}

function searchEvent(req, res) {
    var params = req.body;

    if (params.search) {
        Event.find({ $or: [{ name: capitalize.capitalizeFirstValue(params.search) },] }, (err, resultSearch) => {
            if (err) {
                console.log(err)
                return res.status(500).send({ message: 'General error' });
            } else if (resultSearch) {

                return res.send({ message: 'Events found: ', resultSearch });
            } else {
                return res.status(403).send({ message: 'Search without coincidences' });
            }
        }).populate('hotel')
    } else {
        return res.status(403).send({ message: 'Type the name in the search bar' });
    }
}

function selectEvent(req, res) {
    let userId = req.params.idU;
    let eventId = req.params.idE;

    User.findById(userId, (err, userFind) => {
        console.log(userFind.invoices);
        if (err) {
            return res.status(500).send({ message: 'General error in users' });
        } else if (userFind) {
            Invoice.findById(userFind.invoices, (err,invoiceFind)=>{
                if(err){
                    return res.status(500).send({ message: 'General error finding the invoice' });
                }else if(invoiceFind){
                    if(invoiceFind.events.length == 0){
                        Invoice.findByIdAndUpdate(userFind.invoices, { $push: { events: eventId } }, (err, invoiceUpdate) => {
                            if (err) {
                                return res.status(500).send({ message: 'General error in the invoice' });
                            } else if (invoiceUpdate) {
                                return res.status(200).send({ message: 'Event added to your invoice!', invoiceUpdate });
                            } else {
                                return res.status(500).send({ message: 'Error while updating the invoice' });
                            }
                        })
                    }else{
                        return res.send({message: "You cannot select another event!"})
                    }
                }else{
                    return res.status(500).send({ message: 'General error in invoice' });
                }
            })
        } else {
            return res.status(500).send({ message: 'This user doesnt exists!' });
        }
    })

}


module.exports = {
    createEvent,
    updateEvent,
    getEvents,
    removeEvent,
    searchEvent,
    selectEvent
}