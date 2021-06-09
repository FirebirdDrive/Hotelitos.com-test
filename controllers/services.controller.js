'use Strict'

var Service = require('../models/services.model');
var capitalize = require("../utils/string-utils");
var Hotel = require('../models/hotel.model');
var Invoice = require('../models/invoice.model');
var User = require('../models/user.model');

function createService(req, res) {
    var service = new Service();
    var params = req.body;
    var hotelId = req.params.idH;

    if (params.description && params.price) {
        service.description = capitalize.capitalizeFirstValue(params.description);
        service.price = params.price;
        if (params.price == "" || params.price < 0) {
            return res.status(404).send({ message: "You cant put a negative value or zero to the price" })
        }
        service.save((err, serviceSaved) => {
            if (err) {
                res.status(404).send({ message: "Error while saving the data" })
            } else if (serviceSaved) {
                Hotel.findByIdAndUpdate(hotelId, { $push: { services: serviceSaved._id } }, { new: true }, (err, hotelUpdate) => {
                    if (err) {
                        return res.status(404).send({ message: "Error while creating the services" })
                    } else if (hotelUpdate) {
                        return res.send({ message: "Services created", serviceSaved })
                    } else {
                        return res.status(404).send({ message: "Error in update the hotel" })
                    }
                })
            } else {
                res.status(404).send({ message: "General error" })
            }
        })
    } else {
        res.status(200).send({ message: "Please type all the fields required" })
    }
}

function updateService(req, res) {
    let serviceId = req.params.id;
    let update = req.body;

    if (update.description == "" || update.price == "" || update.price <= 0) {
        return res.status(401).send({ message: 'You cant put the description and price field in blank ' });
    }
    Service.findByIdAndUpdate(serviceId, update, { new: true }, (err, serviceUpdated) => {
        if (err) {
            return res.status(500).send({ message: 'General error in the update' });
        } else if (serviceUpdated) {
            return res.send({ message: 'Service updated', serviceUpdated });
        } else {
            return res.send({ message: 'The service it cant be updated' });
        }
    })
}

function getServices(req, res) {
    Service.find({}).exec((err, services) => {
        if (err) {
            res.status(500).send({ message: "Error while searching" })
        } else if (services) {
            res.status(200).send({ message: "Services found:", services })
        } else {
            res.status(200).send({ message: "There is no data" })
        }
    })
}

function removeService(req, res) {
    let hotelId = req.params.idH
    let serviceId = req.params.idS;

    Hotel.findByIdAndUpdate({ _id: hotelId, services: serviceId }, { $pull: { services: serviceId } }, { new: true }, (err, servicePull) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: 'General error' });
        } else if (servicePull) {
            Service.findByIdAndRemove(serviceId, (err, serviceRemoved) => {
                if (err) {
                    return res.status(404).send({ message: "Error while trying to delete" })
                } else if (serviceRemoved) {
                    return res.send({ message: 'Service deleted', servicePull });
                } else {
                    return res.status(404).send({ message: "This service doesnt exist or it was already deleted" })
                }
            })
        } else {
            return res.status(500).send({ message: 'The hotel service it couldnt be deleted' });
        }
    }).populate('service')
}

function selectService(req, res) {
    let userId = req.params.idU;
    let serviceId = req.params.idS;

    User.findById(userId, (err, userFind) => {
        console.log(userFind.invoices);
        if (err) {
            return res.status(500).send({ message: 'General error in users' });
        } else if (userFind) {
            Invoice.findByIdAndUpdate(userFind.invoices, { $push: { services: serviceId } }, (err, invoiceUpdate) => {
                if (err) {
                    return res.status(500).send({ message: 'General error in the invoice' });
                } else if (invoiceUpdate) {
                    return res.status(200).send({ message: 'Service added to your invoice!', invoiceUpdate });
                } else {
                    return res.status(500).send({ message: 'Error while updating the invoice' });
                }
            })
        } else {
            return res.status(500).send({ message: 'This user doesnt exists!' });
        }
    })

}





module.exports = {
    createService,
    updateService,
    getServices,
    removeService,
    selectService
}