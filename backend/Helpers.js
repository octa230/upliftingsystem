import express from 'express';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import path from 'path';
import streamifier from 'streamifier';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'



dotenv.config()

const upload = multer();




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


UploadRouter.post(
  '/',
  upload.single('file'),
  async (req, res) => {
    try {
      // Cloudinary configuration
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Stream upload function
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      // Upload the file to Cloudinary
      const result = await streamUpload(req);

      // Send the result back to the client
      res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error uploading the file' });
    }
  }
);

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

