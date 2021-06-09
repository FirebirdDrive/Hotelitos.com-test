'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
const SECRET_KEY = 'Shhhh'

exports.createToken = (user) => {
    var payload = {
        sub: user._id,
        username: user.username,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(5, 'hours').unix()
    }
    return jwt.encode(payload, SECRET_KEY)
}