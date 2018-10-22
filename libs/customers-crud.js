const express = require('express');
const path = require('path');
const bp = require('body-parser');
const admin = require('firebase-admin');

admin.firestore.FieldValue.serverTimestamp();
var db = admin.firestore();
var customersCollection = db.collection('customers');

module.exports = function () {
    //create a router / mini express app
    const router = express.Router();

    // GET  /api/customers --gets all customers
    router.get('/customers', (req, res) => {
        customersCollection.get()
            .then(snapshot => {
                let customersArr = [];
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    customersArr.push(doc.data());
                });
                res.status(200).json(customersArr);
            })
            .catch(err => {
                console.log('>>>>>>>Error getting docs', err);
            });
    });
    // GET /api/customers/name (/?cust_name=lina)--gets customer record by name
    router.get('/customers/name', (req, res)=>{
        let customerName = req.query.cust_name;
      
        customersCollection
            .where('cust_name', '==', customerName)
            .limit(20)
        .get()
        .then(snapshot => {
            let customersArr = [];
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                customersArr.push(doc.data());
            });
            res.status(200).json(customersArr);
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
    });

    // POST /api/customers test on ARC, {"cust_name":"", "cust_orders":{0:"", 1:""}}
    router.post('/customers', (req, res) => {
        let customer = req.body;
        console.log(customer);
        customersCollection.doc()
            .create(customer)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json(error));
    });
    // POST /api/customers/:id test on ARC
    router.post('/customers/:id', (req, res) => {
        let customer = req.body;
        let idValue = req.params.id;
        console.log(customer);
        customersCollection.doc(idValue)
            .set(customer)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json(error));
    });
    //PUT /api/customers/:id -for edit or update of existing customer record with id test on ARC
    router.put('/customers/:id', (req, res) => {
        let idValue = req.params.id;
        let customer = req.body;
        customersCollection.doc(idValue).update(
            customer
            , { merge: true });
        res.status(200).json(customer);
    });
    // DELETE /api/customers/:id
    router.delete('/customers/:id', (req, res) => {
        let idValue = req.params.id;
        customersCollection.doc(idValue).delete().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(error);
        });
    });
    return (router);
}

