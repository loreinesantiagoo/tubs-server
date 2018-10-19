const express = require('express');
const path = require('path');
const bp = require('body-parser');
const admin = require('firebase-admin');

admin.firestore.FieldValue.serverTimestamp();
var db = admin.firestore();
var invoiceCollection = db.collection('invoice');

module.exports = function () {
    //create a router / mini express app
    const router = express.Router();

    // GET /api/invoice ---query invoice collection
    router.get('/invoice', (req, res) => {
        invoiceCollection.get()
            .then(snapshot => {
                let invoiceArr = [];
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    invoiceArr.push(doc.data());
                });
                res.status(200).json(invoiceArr);
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    });
    // POST /api/invoice -- creates and save new invoice
    router.post('/invoice', (req, res) => {
        let INVOICE = req.body;

        console.log(INVOICE);
        invoiceCollection.doc()
            // .add(INVOICE => res.status(201).json(inv_body))
            .create(INVOICE)
            .then(result => res.status(200).json(result.id))
            // console.log('push key', result.id)
            .catch(error => res.status(500).json(error));
    })
    //PUT /api/invoice/:id test on ARC ----for updating invoice  status(true=paid, false=waitingpayment) with id
    router.put('/invoice/:id', (req, res) => {
        let idValue = req.params.id;
        let invoice = req.body.status;
        invoiceCollection.doc(idValue).update(
            invoice
            , { merge: true });
        res.status(200).json(invoice);
    });
    // DELETE method is not allowed for invoice collection
    return (router);
}