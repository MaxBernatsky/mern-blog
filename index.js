import express from 'express';
import mongoose from 'mongoose';

import {
  loginValidation,
  postCreateValidation,
  registerValidation,
} from './validations/index.js';

import checkAuth from './utils/checkAuth.js';

import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';

mongoose
  .connect('mongodb://127.0.0.1/blogdb')
  .then(() => console.log('DB ok'))
  .catch((error) => console.log('DB error', error));

const app = express();
app.use(express.json());

app.post('/auth/register', registerValidation, UserController.register);
app.post('/auth/login', loginValidation, UserController.login);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, PostController.update);

app.listen(4444, (error) => {
  if (error) {
    return console.log(error);
  }
  console.log('Server OK');
});
