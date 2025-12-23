import express from 'express';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import {v4 as uuidv4} from 'uuid'
import path from 'path';
import streamifier from 'streamifier';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import Handlebars from 'handlebars';
import {ToWords} from 'to-words'
import fs from 'fs';

dotenv.config()

// Create photos directory if it doesn't exist
const photosDir = 'uploads/photos';
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

// Disk storage for photos
const photoStorage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'uploads/photos')
  },
  filename: function(req, file, cb){
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
})

const photoUpload = multer({storage: photoStorage})

// Disk storage for bills
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'uploads/bills')
  },
  filename: function(req, file, cb){
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
})

const dskUploads = multer({storage: storage})


export const UploadRouter = express.Router();

// Photo upload to disk (no Cloudinary)
UploadRouter.post(
  '/',
  photoUpload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
      }

      // Send back file info
      res.status(200).send({
        success: true,
        message: 'Photo uploaded successfully',
        filePath: req.file.path,
        fileName: req.file.filename,
        secure_url: `/uploads/photos/${req.file.filename}`
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error uploading the file' });
    }
  }
);

// Bill upload to disk
UploadRouter.post('/bill', dskUploads.single('file'), (req, res)=>{
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // File metadata is in req.file
  res.send({
    message: 'File uploaded successfully!',
    filePath: req.file.path,
    fileName: req.file.filename
  });
})


export const generateToken = (user) => {
    return jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );
};


export const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.status(401).send({ message: 'Invalid Token' });
        } else {
          req.user = decoded;
          next();
        }
      });
    } else {
      res.status(401).send({ message: 'No Token' });
    }
  };

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(401).send({ message: 'Invalid Admin Token' });
    }
  };


export const ErrorHandler = (err, req, res, next)=>{

    const statusCode = res.statusCode ? res.statusCode: 500

    res.status(statusCode)
    res.json({
        message: res.message,
        stack: process.env.NODE_ENV === "development" ? 
        err.stack : null
    })
}

const toWordsInstance = new ToWords({
  localeCode: 'en-AE', // Ensure correct locale
  converterOptions: {
    currency: true, // Enable currency mode
    currencyOptions: {
      name: 'Dirham',
      plural: 'Dirhams',
      symbol: 'AED',
      fractionalUnit: {
        name: 'fill',
        plural: 'fills',
        symbol: '',
      },
    },
  },
});


export const toWords =async(number)=> {
  return toWordsInstance.convert(number)
}


Handlebars.registerHelper('formatDate', function(date) {
  if(!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
})

Handlebars.registerHelper('formatCurrency', function(number) {
  return (number || 0).toFixed(2)
})

// Register the 'eq' helper to check if two values are equal
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});


export const generateId = async()=> uuidv4().slice(0, 8).toString()