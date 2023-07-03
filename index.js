import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';

import fs from 'fs';

import {
  loginValidation,
  postCreateValidation,
  registerValidation,
} from './validations/validations.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';
import handleValidationErrors from './utils/handleValidationErrors.js';

mongoose
  .connect('mongodb://127.0.0.1/blogdb')
  .then(() => console.log('DB ok'))
  .catch((error) => console.log('DB error', error));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

app.listen(4444, (error) => {
  if (error) {
    return console.log(error);
  }
  console.log('Server OK');
});
