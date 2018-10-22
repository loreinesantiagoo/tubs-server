const express = require('express');
const path = require('path');
const bp = require('body-parser');
const admin = require('firebase-admin');

admin.firestore.FieldValue.serverTimestamp();
var db = admin.firestore();
var productsCollection = db.collection('products');

module.exports = function () {
    //create a router / mini express app
    const router = express.Router();

    // GET /api/products --gets all products list
    router.get('/products', (req, res) => {
        productsCollection
            .limit(10)
            .get()
            .then(snapshot => {
                let productsArr = [];
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    productsArr.push(doc.data());
                });
                res.status(200).json(productsArr);
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    });
    // GET /api/products/name - (products?name=tubs+bidet+seat+D) -search products using product name(e.g. tubs bidet seat D)
    router.get('/products/name/', (req, res) => {
        let productName = req.query.product_name;
       console.log('>>ffffffff>>>>>>',productName);
        productsCollection
            .where('product_name', '==', productName)
            .get()
            .then(snapshot => {
                let productsArr = [];
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    productsArr.push(doc.data());
                })
                res.status(200).json(productsArr);
            }).catch(err => {
                res.status(400).json({ error: err });
                console.log('ERROR GETTING DOCS', err );
            })
    });
    // POST /api/products test on ARC,creates new product record {"product_name":"", "cost_price":"", "quantity":"", "unit_price":""}
    router.post('/products', (req, res) => {
        let products = req.body;
        console.log(products);
        productsCollection.doc()
            .create(products)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json(error));
    });
    // POST /api/products/:id test on ARC -- edits existing product with specified id
    router.post('/products/:id', (req, res) => {
        let product = req.body;
        let idValue = req.params.id;
        console.log(product);
        productsCollection.doc(idValue)
            .set(product)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json(error));
    });
    //PUT /api/products/:id test on ARC--updates existing product record 
    router.put('/products/:id', (req, res) => {
        let idValue = req.params.id;
        let product = req.body;
        productsCollection.doc(idValue).update(
            product
            , { merge: true });
        res.status(200).json(product);
    });
    // DELETE /api/products/:id test on ARC ---deletes a product record
    router.delete('/products/:id', (req, res) => {
        let idValue = req.params.id;
        productsCollection.doc(idValue).delete().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(error);
        });
    });

    return (router);

}