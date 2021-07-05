'use strict'

var mongoose = require('mongoose');
var UserController = require('./controllers/user.controller');

var app = require('./app')
var port = process.env.PORT || 3000;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://FirebirdCS:Transformice1@hotelitos.okey1.mongodb.net/HotelitosDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado a la base de datos.')
        UserController.createAppAdministrator();
        app.listen(port, () => {
            console.log('Servidor de express en línea');
        })
    })
    .catch((err) => {
        console.log('Error al conectarse a la base de datos', err)
    })
