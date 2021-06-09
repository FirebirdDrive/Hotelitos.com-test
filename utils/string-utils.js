'use strict'

var capitalize = require("smart-capitalize");

function getLowerCaseValue(value) {
    return value.toLowerCase().trim();
}

function capitalizeFirstValue(value) {
    return capitalize.capitalize(value.toLowerCase().trim());
}

function capitalizeAllValue(value) {
    return capitalize.capitalizeAll(value.toLowerCase().trim());
}

module.exports = {
    getLowerCaseValue,
    capitalizeFirstValue,
    capitalizeAllValue
}