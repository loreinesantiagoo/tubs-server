const express = require('express');
const path = require('path');
const bp = require('body-parser');
const multer = require('multer');
const uuidv5 = require('uuid/v5');
const admin = require('firebase-admin');
const cors = require('cors');
const googleStorage = require('@google-cloud/storage');
// const functions = require('firebase-functions');

const app = express();
app.use(cors());
app.use(bp.urlencoded({ extended: false }))
app.use(bp.json({ limit: "50mb" }));

// const firestore = firebase.firestore();
//   const settings = {/* your settings... */ timestampsInSnapshots: true};
//   firestore.settings(settings);
//   const timestamp = snapshot.get('created_at');
//   const date = timestamp.toDate();

const dbInit = admin.initializeApp(require('./libs/db_init'));
admin.firestore.FieldValue.serverTimestamp();

var db = admin.firestore();
var invoiceCollection = db.collection('invoice');

const API_URI = "/api";
var addedCounter = 0;
var updateCounter = 0;


//subscribe-invoice
var unSubscribe = subscribeInvoice();

function subscribeInvoice() {
    return invoiceCollection.onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            //console.log(snapshot);
            snapshot.docChanges.forEach((data) => {
                console.log(`>>>>>${Date()} ${updateCounter}` + data.type);
                if (data.type === 'modified') {
                    //do #1
                    updateCounter = updateCounter + 1;
                } else if (data.type === 'added') {
                    //do #1
                    addedCounter = addedCounter + 1;
                }
            })
        }
    });
}

const FILEUPLOAD = require('./libs/file_upload');
const customersCRUD = require('./libs/customers-crud');
const invoiceCRUD = require('./libs/invoice-crud');
const productsCRUD = require('./libs/products-crud');


// routes
const FILEUPLOADrouter = FILEUPLOAD(dbInit);
const CUSTOMERSrouter = customersCRUD(dbInit);
const INVOICErouter = invoiceCRUD(dbInit);
const PRODUCTSrouter = productsCRUD(dbInit);


app.use(API_URI + '/v1/upload', FILEUPLOADrouter);
app.use(API_URI + '/v1', CUSTOMERSrouter);
app.use(API_URI + '/v1', INVOICErouter);
app.use(API_URI + '/v1', PRODUCTSrouter);


// app.post(API_URI + '/multiple-upload', googleMulter.array('photos', 10), function (req, res, next) {
//     res.status(200).json({});
// });



// listen to document changes belonging to invoice collection
app.get(API_URI + '/unsubscribe-invoice', (req, res) => {
    unSubscribe();
    res.status(200)
        .json(
            {
                addedCounter: addedCounter,
                updateCounter: updateCounter
            });
});
app.get(API_URI + '/subscribe-invoice', (req, res) => {
    unSubscribe = subscribeInvoice();
    res.status(200)
        .json(
            {
                addedCounter: addedCounter,
                updateCounter: updateCounter
            });
})
const PORT = parseInt(process.argv[2]) ||
    parseInt(process.env.APP_PORT) || 3000

app.listen(PORT, () => {
    console.info('application started on %d at %s', PORT);
});
