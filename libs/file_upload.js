const express = require('express');
const path = require('path');
const bp = require('body-parser');
const multer = require('multer');
const uuidv5 = require('uuid/v5');
const admin = require('firebase-admin');
const googleStorage = require('@google-cloud/storage');

const gStorage = googleStorage({
    projectId: 'tubs-c616c',
  });
console.log(gStorage);
const bucket = gStorage.bucket('tubs-c616c.appspot.com');

const gMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 //20MB
    }
})

admin.firestore.FieldValue.serverTimestamp();
var db = admin.firestore();
var bidet_seat_galleryCollection = db.collection('bidet_seat_gallery');

module.exports = function () {
    //create a router / mini express app
    const router = express.Router();

    function debugReq(req,res,next){
        //console.log(req);
        console.log(req.file);
        next();
    }
    
    // config routes
    //file upload - POST /api/upload
    router.post('/upload', debugReq, gMulter.single('photos'), (req, res) => {
        console.log("upload>>>");
        if (req.file != null) {
            console.log(req.file);
            uploadToFirebase(req.file).then((result) => {
                console.log(result);
                console.log(result.data);
                var bidet_seat_galleryData = {
                    filename: result
                }
                bidet_seat_galleryCollection
                    .add(bidet_seat_galleryData)
                    .then(result => res.status(200).json(bidet_seat_galleryData))
                    .catch(error => res.status(500).json(error));
            }).catch((error) => {
                console.log(error);
                res.status(500).json(error);
            })
        } else {
            res.status(500).json({ error: "error in uploading" });
        }
    });
    const uploadToFirebase = (fileObject)=> {
        return new Promise((resolve, reject)=>{
            if(!fileObject){
                reject('Invalid file upload');
            }
            let idValue =  uuidv5('upload.loreinesantiagoo.asia', uuidv5.DNS);
            console.log(idValue);
            
            let newFilename = `${idValue}_${fileObject.originalname}`
            console.log(newFilename);
            
            let firebaseFileUpload = bucket.file(newFilename);
            console.log(firebaseFileUpload);
            
            const blobStream = firebaseFileUpload.createWriteStream({
                metadata: {
                    contentType: fileObject.mimeType,
                    cacheControl: 'public, max-age=31536000'
                }
            });
    
            blobStream.on("error", (error)=>{
                console.log("error !!!! " + error);
                reject("Error in uploading file stream problem !");
            });
    
            blobStream.on("finish", ()=>{
                console.log("FINISH !"); 
                fileObject.fileURL = `https://firebasestorage.googleapis.com/v0/b/tubs-c616c.appspot.com/o/${firebaseFileUpload.name}?alt=media&token=72351edd-a523-448b-8df0-8a3bed2939ce`;
                resolve(fileObject.fileURL);
            });
    
            blobStream.end(fileObject.buffer);
        });
    }
    return (router);
}