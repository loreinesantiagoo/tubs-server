const admin = require('firebase-admin');
const googleStorage = require('@google-cloud/storage');
// console.log(googleStorage);


const credFile = process.env.SERVICEACC_CRED_FILE || "../forbeats.json";
console.log(credFile);
var serviceAccount = require(credFile);

admin.firestore.FieldValue.serverTimestamp();

module.exports = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tubs-c616c.firebaseio.com"
}

