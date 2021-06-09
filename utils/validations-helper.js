'use strict'

var validator = require('validator');

const HOTEL_ADMIN = "HOTEL_ADMIN";
const USER = "USER";

function isEmail(val) {
    return validator.isEmail(val.trim());
}

function isValidUser(val) {
    return val.trim() === HOTEL_ADMIN;
}

function isValidExtension(ext) {
    return ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif'
        || ext === 'PNG' || ext === 'JPG' || ext === 'JPEG' || ext === 'GIF';
}

function getExtension(filename) {
    return !filename ? null : filename.substr(filename.lastIndexOf(".") + 1);
}

const test = "C:\\Users\\laynezcodertest\\Pictures\\test\\12252....8072.4.87..61220.0595_n.png"
console.log(`Test: ${getExtension(test)}`);

module.exports = {
    isEmail,
    isValidUser,
    isValidExtension,
    getExtension
}