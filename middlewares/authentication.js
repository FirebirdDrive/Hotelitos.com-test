'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

const HOTEL_ADMIN = "HOTEL_ADMIN";
const APP_ADMIN = "APP_ADMIN";
const USER = "USER";
const SECRET_KEY = 'Shhhh'

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'The request does not have an authentication header!' })
    } else {
        var token = req.headers.authorization.replace(/['"']+/g, '');
        try {
            var payload = jwt.decode(token, SECRET_KEY);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'Token has expired' })
            }
        } catch (err) {
            return res.status(404).send({ message: 'Invalid Token' })
        }

        req.user = payload;
        next();
    }
}

exports.ensureAuthAppAdministrator = (req, res, next) => {
    let payload = req.user;

    if (payload.role !== APP_ADMIN) {
        return res.status(404).send({ message: 'You do not have permission to enter this route!' })
    } else {
        return next();
    }
}

exports.ensureAuthHotelAdministrator = (req, res, next) => {
    let payload = req.user;

    if (payload.role !== HOTEL_ADMIN) {
        return res.status(404).send({ message: 'You do not have permission to enter this route!' })
    } else {
        return next();
    }
}

exports.ensureAuthUser = (req, res, next) => {
    let payload = req.user;

    if (payload.role !== USER) {
        return res.status(404).send({ message: 'You do not have permission to enter this route!' })
    } else {
        return next();
    }
}