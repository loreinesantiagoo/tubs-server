require('dotenv').config();
const express = require('express'),
    path = require('path'),
    bp = require('body-parser'),
    multer = require('multer'),
    uuidv5 = require('uuid/v5'),
    admin = require('firebase-admin');
    // jwt = require('jsonwebtoken'),
    // crypto = require('crypto'),
    // passport = require('passport'),
    // LocalStrategy = require('passport-local').Strategy,
    // auth = require('./libs/auth');

const cors = require('cors');
const { Storage } = require('@google-cloud/storage');

const firebase = require('firebase-functions');

const app = express();

app.use(cors());
// app.use(passport.initialize());
app.use(bp.urlencoded({ extended: false }))
app.use(bp.json({ limit: "50mb" }));

//export GOOGLE_APPLICATION_CREDENTIALS=/Users/loreinesantiago/fsf/tubs-server/forbeats.json

const dbInit = require('./libs/db_init');
const isAuthenticated = require('./libs/db_init');
admin.firestore.FieldValue.serverTimestamp();

var db = admin.firestore();
const settings = { timestampsInSnapshots: true };

db.settings(settings);

const API_URI = "/api";
var addedCounter = 0;
var updateCounter = 0;

// crypto functions
// const cryptoFunction = require('./libs/crypto');

//subscribe-invoice
// var invoiceCollection = db.collection('invoice');

// var unSubscribe = subscribeInvoice();

// function subscribeInvoice() {
//     return invoiceCollection.onSnapshot((snapshot) => {
//         if (!snapshot.empty) {
//             //console.log(snapshot);
//             snapshot.docChanges.forEach((data) => {
//                 console.log(`>>>>>${Date()} ${updateCounter}` + data.type);
//                 if (data.type === 'modified') {
//                     //do #1
//                     updateCounter = updateCounter + 1;
//                 } else if (data.type === 'added') {
//                     //do #1
//                     addedCounter = addedCounter + 1;
//                 }
//             })
//         }
//     });
// }

const FILEUPLOAD = require('./libs/file_upload');
const customersCRUD = require('./libs/customers-crud');
const invoiceCRUD = require('./libs/invoice-crud');
const productsCRUD = require('./libs/products-crud');


// routes
const FILEUPLOADrouter = FILEUPLOAD(dbInit);
const CUSTOMERSrouter = customersCRUD(dbInit);
const INVOICErouter = invoiceCRUD(dbInit);
const PRODUCTSrouter = productsCRUD(dbInit);


app.use(API_URI + '/file', FILEUPLOADrouter);
app.use(API_URI + '', CUSTOMERSrouter);
app.use(API_URI + '', INVOICErouter);
app.use(API_URI + '', PRODUCTSrouter);


// app.post(API_URI + '/multiple-upload', googleMulter.array('photos', 10), function (req, res, next) {
//     res.status(200).json({});
// });

/////////// listen to document changes belonging to invoice collection
// app.get(API_URI + '/unsubscribe-invoice', (req, res) => {
//     unSubscribe();
//     res.status(200)
//         .json(
//             {
//                 addedCounter: addedCounter,
//                 updateCounter: updateCounter
//             });
// });
// app.get(API_URI + '/subscribe-invoice', (req, res) => {
//     unSubscribe = subscribeInvoice();
//     res.status(200)
//         .json(
//             {
//                 addedCounter: addedCounter,
//                 updateCounter: updateCounter
//             });
// })
app.use(express.static(path.join(__dirname, '../dist/tubs')))

const PORT = parseInt(process.argv[2]) ||
    parseInt(process.env.APP_PORT) || 3000

app.listen(PORT, () => {
    console.info('application started on %d at %s', PORT);
});
