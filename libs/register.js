const express = require('express');
const path = require('path');
const bp = require('body-parser');
const cryptoFunctions = require('./crypto.js');


module.exports = function () {
    //create a router / mini express app
    const router = express.Router();

    router.post(API_URI + '/register', bp.urlencoded({ extended: true }), bp.json({ limit: "50MB" }),
        (req, res) => {
            console.log("Post backend register");
            let registerForm = req.body;
            let registrationObj = { ...registerForm };
            console.log(JSON.stringify(registrationObj));
            let convertSecObj = convertPasswordToHash(registrationObj.password);
            registrationObj.password = convertSecObj.hash;
            registrationObj.salt = convertSecObj.salt;

            Users
            .create(user)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json(error));
        }
    )
    return (router);
}