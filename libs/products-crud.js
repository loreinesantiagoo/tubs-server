const express = require('express');
const path = require('path');
const bp = require('body-parser');
const admin = require('firebase-admin');
const isAuthenticated = require('./db_init');


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
                    // console.log('prod', prod);
                });
                res.status(200).json(productsArr);
            })
            .catch(err => {
                console.log('Error getting documents', err);
                res.status(500).json(err);
            });
    });
    // GET /api/products/:id - (products/uYx8ZxYHEE92qEZtk3rc) -search products using product name(e.g. tubs bidet seat D)
    router.get('/products/:id', (req, res) => {
        let idValue = req.params.id;
        console.log('>>ffffffff>>>>>>', idValue);

        productsCollection.doc(idValue)
            .get()
            .then((result) => {
                console.log(result.data());
                var productsData = {
                    id: result.data().idValue,
                    productName: result.data().productName,
                    quantity: result.data().quantity,
                    unit_price: result.data().unit_price,
                    cost_price: result.data().cost_price,
                    product_image: result.data().product_image
                }
                res.status(200).json(productsData)
            })
            .catch(err => {
                console.log('Error getting products/:id server', err);
                res.status(500).json(err);
            })
    });
    // GET /api/products/name
    router.get('/products/name', (req, res) => {
        let productName = req.query.productName;
        console.log(productName);

        if (typeof (productName === 'undefined')) {
            if (productName === '') {
                console.log('productName undefined');
                res.status(500).json({ error: 'productName undefined>>>' });
            }
        }

        productsCollection
            .where('productName', '==', productName)
            .get()
            .then((result) => {
                let productsData = []

                productsData = result.docs.map(value => {
                    return value.data();
                });

                res.status(200).json(productsData)
            })
            .catch(err => {
                console.log('Error getting product by name', err);
                res.status(500).json(err);
            })
    });
    // POST /api/products test on ARC,creates new product record {"product_name":"", "cost_price":"", "quantity":"", "unit_price":""}
    router.post('/products', isAuthenticated, bp.urlencoded({ extended: true }), bp.json({ limit: '50MB' }),(req, res) => {
        let products = {... req.body};
        console.log(products);
        productsCollection.doc()
            .create(products)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json(error));
    });
    // POST /api/products/:id test on ARC -- edits existing product with specified id
    router.post('/products/:id', isAuthenticated, (req, res) => {
        let product = req.body;
        let idValue = req.params.doc.data().id;
        console.log(product);
        productsCollection.doc(idValue)
            .set(product)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json(error));
    });
    //PUT /api/products/:id test on ARC--updates existing product record 
    router.put('/products/:id', isAuthenticated, (req, res) => {
        let idValue = req.params.doc.data().id;
        let product = req.body;
        productsCollection.doc(idValue).update(
            product
            , { merge: true });
        res.status(200).json(product);
    });
    // DELETE /api/products/:id test on ARC ---deletes a product record
    router.delete('/products/:id', isAuthenticated, (req, res) => {
        let idValue = req.params.doc.data().id;
        productsCollection.doc(idValue).delete().then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            res.status(500).json(error);
        });
    });

    return (router);

}