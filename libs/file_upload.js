const express = require('express');
const path = require('path');
const bp = require('body-parser');
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const admin = require('firebase-admin');
const googleStorage = require('@google-cloud/storage');
const isAuthenticated = require('./db_init');

const projectId = process.env.FIREBASE_PROJECT_ID;
console.log(projectId);
const storage = googleStorage({
    projectId: projectId
});
// console.log(storage);
const bucket = storage.bucket('tubs-c616c.appspot.com');

const gMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 //20MB
    }
})

admin.firestore.FieldValue.serverTimestamp();
var db = admin.firestore();
var galleryCollection = db.collection('gallery');

module.exports = function () {
    //create a router / mini express app
    const router = express.Router();

    // function debugReq(req,res,next){
    //     console.log(req);
    //     console.log(req.file);
    //     next();
    // }


    //file upload - POST /api/file/upload
    router.post('/upload', isAuthenticated, gMulter.single('photos'), (req, res) => {
        console.log("upload>>>");
        if (req.file != null) {
            console.log(req.file);
            uploadToFirebase(req.file).then((result) => {
                console.log(result);
                console.log(result.data);
                var galleryData = {
                    filename: result
                }
                galleryCollection
                    .add(galleryData)
                    .then(result => res.status(200).json(bgalleryData))
                    .catch(error => res.status(500).json(error));
            }).catch((error) => {
                console.log(error);
                res.status(500).json(error);
            })
        } else {
            res.status(500).json({ error: "error in uploading" });
        }
    });
    const uploadToFirebase = (fileObject) => {
        return new Promise((resolve, reject) => {
            if (!fileObject) {
                reject('Invalid file upload');
            }
            let idValue = uuidv4();
            console.log(idValue);

            let newFilename = `${idValue}_${fileObject.originalname}`
            console.log(newFilename);

            let firebaseFileUpload = bucket.file(newFilename);
            console.log(firebaseFileUpload);

            const blobStream = firebaseFileUpload.createWriteStream({
                metadata: {
                    contentType: fileObject.mimetype,
                    cacheControl: 'public, max-age=31536000'
                }
            });

            blobStream.on("error", (error) => {
                console.log("error !!!! " + error);
                reject("Error in uploading file stream problem !");
            });

            blobStream.on("finish", () => {
                console.log("FINISH !");
                fileObject.fileURL = `https://firebasestorage.googleapis.com/v0/b/tubs-c616c.appspot.com/o/${firebaseFileUpload.name}?alt=media&token=72351edd-a523-448b-8df0-8a3bed2939ce`;
                resolve(fileObject.fileURL);
            });

            blobStream.end(fileObject.buffer);
        });
    }
    return (router);
}