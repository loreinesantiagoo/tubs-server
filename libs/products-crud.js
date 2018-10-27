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
                    console.log(doc.id, '=>', doc.id);
                    let prod = {
                        id: doc.id,
                        product_data: doc.data()
                    }
                    console.log()
                    productsArr.push(prod);
                });
                res.status(200).json(productsArr);
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    });
    // GET /api/products/:id - (products?id=uYx8ZxYHEE92qEZtk3rc) -search products using product name(e.g. tubs bidet seat D)
    router.get('/products/:id', (req, res) => {
        let productId = req.params.id;
       console.log('>>ffffffff>>>>>>',productId);
        productsCollection
            .where('product_name', '==', productId)
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
        let idValue = req.params.doc.data().id;
        console.log(product);
        productsCollection.doc(idValue)
            .set(product)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json(error));
    });
    //PUT /api/products/:id test on ARC--updates existing product record 
    router.put('/products/:id', (req, res) => {
        let idValue = req.params.doc.data().id;
        let product = req.body;
        productsCollection.doc(idValue).update(
            product
            , { merge: true });
        res.status(200).json(product);
    });
    // DELETE /api/products/:id test on ARC ---deletes a product record
    router.delete('/products/:id', (req, res) => {
        let idValue = req.params.doc.data().id;
        productsCollection.doc(idValue).delete().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(error);
        });
    });

    return (router);

}