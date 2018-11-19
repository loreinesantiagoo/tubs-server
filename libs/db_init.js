const admin = require('firebase-admin');

const credFile = process.env.SERVICEACC_CRED_FILE || "../forbeats.json";
console.log(credFile);
var serviceAccount = require(credFile);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const isAuthenticated = function(req, res, next) {
    const authorization = req.header('Authorization');
    if (authorization) {
        admin.auth().verifyIdToken(authorization)
        .then((decodedToken) => {
            console.log(decodedToken); //Check decoding
            res.locals.user = decodedToken;
            next();
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(401);
        });
    } else {
        console.log('Authorization header is not found');
        res.sendStatus(401);
    }
};
module.exports = isAuthenticated;

