'use strict'

var User = require('../models/user.model');
var Hotel = require('../models/hotel.model');
var bcrypt = require('bcrypt-nodejs');
var validator = require('../utils/validations-helper');
var stringUtils = require('../utils/string-utils');
var jwt = require('../services/jwt');
var pathRequire = require('path');
var fs = require('fs');
var pdf = require('html-pdf');
var Booking = require('../models/bookings.model');
var Room = require('../models/rooms.model');

const APP_ADMIN = 'APP_ADMIN';
const HOTEL_ADMIN = "HOTEL_ADMIN";
const USER = "USER";

/**
 * General functions
 */
function createAppAdministrator() {
    const admin = new User();

    User.findOne({ username: 'admin' }, (err, createAdmin) => {
        if (err) {
            console.log('Failed to create user!');
        } else if (createAdmin) {
            console.log('Administrator user is already created!');
        } else {
            bcrypt.hash('12345', null, null, (err, passwordHash) => {
                if (err) {
                    console.log('Password encryption error!');
                } else if (passwordHash) {
                    admin.firstName = 'Admin';
                    admin.lastName = 'Admin';
                    admin.username = 'admin';
                    admin.email = 'admin@hotelitos.com'
                    admin.password = passwordHash;
                    admin.role = APP_ADMIN;

                    admin.save((err, userSaved) => {
                        if (err) {
                            console.log('Failed to create user!');
                        } else if (userSaved) {
                            console.log('Admin user created!');
                        } else {
                            console.log('Admin user not created!');
                        }
                    })
                }
            })
        }
    })
}

function login(req, res) {
    const body = req.body;

    if (body.username && body.password) {
        User.findOne({ username: stringUtils.getLowerCaseValue(body.username) }, (err, find) => {
            if (err) {
                res.status(500).send({ message: 'Server error trying to search!' });
            } else if (find) {
                bcrypt.compare(body.password.trim(), find.password, (err, checkPassword) => {
                    if (err) {
                        res.status(500).send({ message: 'General server error!' });
                    } else if (checkPassword) {
                        if (body.getToken) {
                            delete find.password;
                            res.send({ token: jwt.createToken(find), user: find });
                        } else {
                            res.send({ message: 'User successfully logged in!' });
                        }
                    } else {
                        res.status(404).send({ message: 'Incorrect username or password!' });
                    }
                });
            } else {
                res.send({ message: 'Account not found!' });
            }
        });
    } else {
        res.send({ message: 'Please enter all the required data!' })
    }
}

/**
 * User functions
 */
function signUp(req, res) {
    const user = new User();
    const body = req.body;

    if (body.firstName && body.lastName && body.username && body.password && body.email) {
        if (validator.isEmail(body.email)) {
            User.findOne({ username: stringUtils.getLowerCaseValue(body.username) }, (err, find) => {
                if (err) {
                    res.status(500).send({ message: 'General error' });
                } else if (find) {
                    res.send({ message: 'Username already used!' });
                } else {
                    bcrypt.hash(body.password.trim(), null, null, (err, passwordHash) => {
                        if (err) {
                            res.status(500).send({ message: 'Password encryption error!' });
                        } else if (passwordHash) {
                            user.firstName = stringUtils.capitalizeAllValue(body.firstName);
                            user.lastName = stringUtils.capitalizeAllValue(body.lastName);
                            user.username = stringUtils.getLowerCaseValue(body.username);
                            user.password = passwordHash;
                            user.email = body.email.trim();
                            user.role = USER;

                            user.save((err, saveUser) => {
                                if (err) {
                                    res.status(500).send({ message: 'General error' });
                                } else if (saveUser) {
                                    res.send({ message: `User ${saveUser.username} has been added successfully!`, saveUser });
                                } else {
                                    res.status(500).send({ message: 'Failed to save data!' });
                                }
                            })
                        } else {
                            res.status(401).send({ message: 'Password not encrypted!' });
                        }
                    })
                }
            })
        } else {
            res.send({ message: 'Enter a valid email!' });
        }
    } else {
        res.send({ message: 'Please enter all the required data!' });
    }
}

function deleteAccount(req, res) {
    const userId = req.params.id;
    const idSession = req.user.sub;
    const body = req.body;

    if (userId === idSession) {
        User.findById(userId, (err, userFind) => {
            if (err) {
                res.status(500).send({ message: 'General error!' });
            } else if (userFind) {
                if (userFind.role === APP_ADMIN || userFind.role === HOTEL_ADMIN) {
                    res.status(500).send({ message: 'Unable to delete administrator' });
                } else {
                    if (body.password) {
                        bcrypt.compare(body.password.trim(), userFind.password, (err, checkPassword) => {
                            if (err) {
                                res.status(500).send({ message: 'Failed to verify password!' });
                            } else if (checkPassword) {
                                User.findByIdAndRemove(userId, (err, userRemoved) => {
                                    if (err) {
                                        res.send({ message: 'Server error!' });
                                    } else if (userRemoved) {
                                        res.send({ message: `User ${userRemoved.username} removed!`, userRemoved });
                                    } else {
                                        res.send({ message: 'The user does not exist, or has already been eliminated' });
                                    }
                                });
                            } else {
                                res.status(403).send({ message: 'Wrong password, you cannot delete your account without your password!' });
                            }
                        })
                    } else {
                        res.send({ message: 'To delete, enter your password' });
                    }
                }
            } else {
                res.status(404).send({ message: 'User not exist!' });
            }
        })
    } else {
        res.send({ message: 'You cannot delete other users!' });
    }
}

// function updateUser(req, res) {
//     const id = req.params.id;
//     const body = req.body;
//     const idSession = req.user.sub;

//     if (id === idSession) {
//         // if (body.password || body.role) {
//         //     res.status(500).send({ message: 'You cannot update the password or role!' });
//         // } else {
//         if (body.firstName && body.lastName && body.username && body.email) {
//             User.findOne({ username: stringUtils.getLowerCaseValue(body.username) }, (err, find) => {
//                 if (err) {
//                     res.status(500).send({ message: 'Server error trying to search!' });
//                 } else if (find) {
//                     if (find.username = 'admin') {
//                         return res.send({ message: 'Update failed!' });
//                     }
//                     User.findByIdAndUpdate({ _id: id }, {
//                         firstName: stringUtils.capitalizeAllValue(body.firstName),
//                         lastName: stringUtils.capitalizeAllValue(body.lastName),
//                         username: stringUtils.getLowerCaseValue(body.username),
//                         email: body.email.trim(),
//                     }, { new: true }, (err, update) => {
//                         if (err) {
//                             res.status(500).send({ message: 'Server error!' });
//                         } else if (update) {
//                             res.send({ message: `User ${update.username} updated! :`, update });
//                         } else {
//                             res.send({ message: 'Update failed!' });
//                         }
//                     })
//                 } else {
//                     User.findByIdAndUpdate({ _id: id }, {
//                         firstName: stringUtils.capitalizeAllValue(body.firstName),
//                         lastName: stringUtils.capitalizeAllValue(body.lastName),
//                         username: stringUtils.getLowerCaseValue(body.username),
//                         email: body.email.trim(),
//                     }, { new: true }, (err, update) => {
//                         if (err) {
//                             res.status(500).send({ message: 'Server error!' });
//                         } else if (update) {
//                             res.send({ message: `User ${update.username} updated! :`, update });
//                         } else {
//                             res.send({ message: 'Update failed!' });
//                         }
//                     })
//                 }
//             })
//         } else {
//             res.send({ message: 'Please enter all the required data!' });
//         }
//         // }
//     } else {
//         res.send({ message: 'You cannot update other users!' });
//     }
// }

function updateUser(req, res) {
    let id = req.params.id;
    let body = req.body;
    const idSession = req.user.sub;

    if (id != idSession) {
        res.status(401).send({ message: 'You do not have permission to perform this action' });
    } else {
        if (body.password) {
            return res.status(401).send({ message: 'Unable to update password' });
        } else {
            if (body.username) {
                User.findOne({ username: stringUtils.getLowerCaseValue(body.username) }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'General error' });
                    } else if (userFind) {
                        if (userFind._id == idSession) {
                            User.findByIdAndUpdate(id, {
                                firstName: stringUtils.capitalizeAllValue(body.firstName),
                                lastName: stringUtils.capitalizeAllValue(body.lastName),
                                username: stringUtils.getLowerCaseValue(body.username),
                                email: body.email.trim(),
                            }, { new: true }, (err, update) => {
                                if (err) {
                                    res.status(500).send({ message: 'General error when updating' });
                                } else if (update) {
                                    res.send({ message: 'Updated user', userUpdated: update });
                                } else {
                                    res.send({ message: 'Could not update user' });
                                }
                            })
                        } else {
                            return res.send({ message: 'Username already in use' });
                        }
                    } else {
                        User.findByIdAndUpdate(id, {
                            firstName: stringUtils.capitalizeAllValue(body.firstName),
                            lastName: stringUtils.capitalizeAllValue(body.lastName),
                            username: stringUtils.getLowerCaseValue(body.username),
                            email: body.email.trim(),
                        }, { new: true }, (err, update) => {
                            if (err) {
                                res.status(500).send({ message: 'General error when updating' });
                            } else if (update) {
                                res.send({ message: 'Updated user', userUpdated: update });
                            } else {
                                res.send({ message: 'Could not update user' });
                            }
                        })
                    }
                })
            } else {
                User.findByIdAndUpdate(id, {
                    firstName: stringUtils.capitalizeAllValue(body.firstName),
                    lastName: stringUtils.capitalizeAllValue(body.lastName),
                    username: stringUtils.getLowerCaseValue(body.username),
                    email: body.email.trim(),
                }, { new: true }, (err, update) => {
                    if (err) {
                        res.status(500).send({ message: 'General error when updating' });
                    } else if (update) {
                        res.send({ message: 'Updated user', userUpdated: update });
                    } else {
                        res.send({ message: 'Could not update user' });
                    }
                })
            }
        }
    }

}

function uploadImage(req, res) {
    const userId = req.params.id;
    const idSession = req.user.sub;
    const path = req.files.image.path;

    if (userId === idSession) {
        if (req.files) {
            let filename = path.substr(path.lastIndexOf("\\") + 1);
            let extension = validator.getExtension(filename);
            if (extension !== null) {
                if (validator.isValidExtension(extension)) {
                    User.findByIdAndUpdate(userId, { image: filename }, { new: true }, (err, userUpdated) => {
                        if (err) {
                            res.status(500).send({ message: 'General error' });
                        } else if (userUpdated) {
                            res.send({ user: userUpdated, userImage: userUpdated.image });
                        } else {
                            res.status(400).send({ message: 'Could not update' });
                        }
                    })
                } else {
                    fs.unlink(path, (err) => {
                        if (err) {
                            res.status(500).send({ message: 'Error' });
                        } else {
                            res.send({ message: 'Invalid extension' })
                        }
                    })
                }
            } else {
                res.status(400).send({ message: 'An unexpected error has occurred' })
            }
        } else {
            res.status(400).send({ message: 'You have not sent an image to upload' })
        }
    } else {
        fs.unlink(path, (err) => {
            if (err) {
                res.status(500).send({ message: 'Error' });
            } else {
                res.send({ message: 'You dont have permissions' })
            }
        })
    }
}

function getImage(req, res) {
    var fileName = req.params.fileName;
    var pathFile = './uploads/users/' + fileName;

    fs.exists(pathFile, (exists) => {
        if (exists) {
            res.sendFile(pathRequire.resolve(pathFile));
        } else {
            res.status(404).send({ message: 'Non-existent image' });
        }
    })
}

/**
 * App administrator functions
 */
function createHotelAdministrator(req, res) {
    const user = new User();
    const body = req.body;

    if (body.firstName && body.lastName && body.username && body.password && body.email && body.hotelName) {
        if (validator.isEmail(body.email)) {
            User.findOne({ username: stringUtils.getLowerCaseValue(body.username) }, (err, find) => {
                if (err) {
                    res.status(500).send({ message: 'General error' });
                } else if (find) {
                    res.send({ message: 'Username already used!' });
                } else {
                    bcrypt.hash(body.password.trim(), null, null, (err, passwordHash) => {
                        if (err) {
                            res.status(500).send({ message: 'Password encryption error!' });
                        } else if (passwordHash) {
                            Hotel.findOne({ name: stringUtils.capitalizeAllValue(body.hotelName) }, (err, hotelFind) => {
                                if (err) {
                                    res.status(500).send({ message: 'General error' });
                                } else if (hotelFind) {
                                    User.findOne({ hotels: hotelFind._id }, (err, users) => {
                                        if (err) {
                                            res.status(500).send({ message: 'Server error trying to search!' })
                                        } else if (users) {
                                            res.send({ message: 'This hotel already has an administrator assigned' })
                                        } else {
                                            user.firstName = stringUtils.capitalizeAllValue(body.firstName);
                                            user.lastName = stringUtils.capitalizeAllValue(body.lastName);
                                            user.username = stringUtils.getLowerCaseValue(body.username);
                                            user.password = passwordHash;
                                            user.email = body.email.trim();
                                            user.role = HOTEL_ADMIN;

                                            user.save((err, saveUser) => {
                                                if (err) {
                                                    res.status(500).send({ message: 'General error' });
                                                } else if (saveUser) {
                                                    let userId = saveUser._id;
                                                    User.findByIdAndUpdate(userId, { $push: { hotels: hotelFind._id } }, { new: true }, (err, user) => {
                                                        if (err) {
                                                            res.status(500).send({ message: 'General error' });
                                                        } else if (user) {
                                                            res.send({ message: `A hotel has been assigned to the user ${user.username}`, hotel: user });
                                                        } else {
                                                            res.status(500).send({ message: 'Failed to save data!' });
                                                        }
                                                    });
                                                } else {
                                                    res.status(500).send({ message: 'Failed to save data!' });
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    res.status(500).send({ message: 'Hotel not found' });
                                }
                            })
                        } else {
                            res.status(401).send({ message: 'Password not encrypted!' });
                        }
                    })
                }
            })
        } else {
            res.send({ message: 'Enter a valid email!' });
        }
    } else {
        res.send({ message: 'Please enter all the required data!' });
    }
}

function getUsers(req, res) {
    User.find({}).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Server error trying to search!' })
        } else if (users) {
            res.send({ message: 'Users found:', users: users })
        } else {
            res.send({ message: 'There are no records!' })
        }
    })
}

function getUsersByHotel(req, res) {
    let userId = req.params.id;

    User.findById(userId, (err, users) => {
        if (err) {
            res.status(500).send({ message: 'Server error trying to search!' })
        } else if (users) {
            res.send({ message: 'Users found:', users: users })
        } else {
            res.send({ message: 'There are no records!' })
        }
    }).populate('hotels');
}

function getUsersByIS(req, res) {
    let userId = req.params.id;

    User.findById(userId, (err, users) => {
        if (err) {
            res.status(500).send({ message: 'Server error trying to search!' })
        } else if (users) {
            res.send({ message: 'Users found:', users: users })
        } else {
            res.send({ message: 'There are no records!' })
        }
    }).populate({
        path: 'invoices',
        populate: {
            path: 'services',
        }
    });
}

function getUsersByBookings(req, res) {
    let userId = req.params.id;

    User.findById(userId, (err, users) => {
        if (err) {
            res.status(500).send({ message: 'Server error trying to search!' })
        } else if (users) {
            res.send({ message: 'Users found:', users: users })
        } else {
            res.send({ message: 'There are no records!' })
        }
    }).populate('bookings');
}

function pdfReservations(req, res) {
    let userId = req.params.id;

    User.findOne({ _id: userId }).exec((err, userFind) => {
        if (err) {
            return res.status(500).send({ message: "General error while searching the user" });
        } else if (userFind) {
            Hotel.findById(userFind.hotels, (err, hotelFind) => {
                if (err) {
                    return res.status(500).send({ message: "General error while searching the hotel" });
                } else if (hotelFind) {
                    let bookings = userFind.bookings;
                    let bookingsFound = [];
                    let bookingsPDF = [];

                    bookings.forEach(elemento => {
                        bookingsFound.push(elemento);
                    })

                    bookingsFound.forEach(elemento => {
                        Booking.find({ _id: elemento }).exec((err, bookingFound) => {
                            if (err) {
                                return res.status(500).send({ message: "General error while searching the bookings" });
                            } else if (bookingFound.length > 0) {
                                let bookings = bookingFound;
                                bookings.forEach(elemento => {
                                    bookingsPDF.push(elemento);
                                })
                                let content = `
                        <!doctype html>
                                <html>
                                <head>
                                <meta charset="utf-8">
                                    <title>Bookings</title>
                                <style>
                                    th {
                                        color: #007bff;
                                        font-size: 30px;
                                        font-family: 'Roboto', sans-serif; 
                                    }
                                    td{
                                        font-size: 20px;
                                        font-family: 'Roboto', sans-serif;
                                    }
                                    .parent {
                                        text-align: center;
                                        background-color: #007bff;
                                    }
                                      
                                    img {
                                        vertical-align: middle;
                                        padding-right: 625px;
                                        padding-bottom: 22px;
                                    }
                                      
                                    p {
                                        display:inline-block;
                                        text-align: center;
                                        color: white;
                                        font-size: 30px;
                                    }
                                </style>
                                <div>
                                        <div class="parent">
                                            <img src="https://i.imgur.com/J1h2caK.png" width="200" height="80" alt="Image"/>
                                            <p>${hotelFind.name}</p>
                                        </div>
                                </div>
                                </head>
                        <table>
                                <tbody>
                                    <tr>
                                        <th style="padding-right: 40px; padding-left: 40px;" text-align: center;> Room </th>
                                        <th style="padding-right: 20px; padding-left: 20px;"> startDate </th>
                                        <th style="padding-right: 20px; padding-left: 20px;"> endDate </th>
                                    </tr>
                                    <tr>
                                       ${bookingsPDF.map(booking => `
                                                            <tr>
                                                            <td style="text-align: center";>${booking.room}</td>
                                                            <td style="text-align: center";>${booking.startDate}</td>
                                                            <td style="text-align: center";>${booking.endDate}</td>
                                                            </tr>
                                                            `).join('')}                   
                                    </tr>
                                </tbody>
                            </table>
                        </body>
                        </html>
                        `;

                                let options = {
                                    paginationOffset: 1,
                                    "header": {
                                        "height": "20px",
                                    }
                                }

                                pdf.create(content, options).toFile('./controllers/' + userId + '.pdf', function (err, res) {
                                    if (err) {
                                        console.log(err);
                                    } else if (res) {
                                        console.log(res);
                                    }
                                })

                            } else {
                                return res.status(500).send({ message: "There is no bookings" });
                            }
                        })
                    })
                } else {
                    return res.status(500).send({ message: "General error " });
                }
            })
            res.sendFile(__dirname + '/' + userId + '.pdf');
        } else {
            return res.status(500).send({ message: "There is no user" });
        }
    })
}

module.exports = {
    createAppAdministrator,
    createHotelAdministrator,
    getUsers,
    login,
    signUp,
    deleteAccount,
    updateUser,
    uploadImage,
    getImage,
    pdfReservations,
    getUsersByHotel,
    getUsersByIS,
    getUsersByBookings
}