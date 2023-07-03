import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import { registerValidation } from './validations/auth.js';
import User from './models/User.js';

mongoose
  .connect('mongodb://127.0.0.1/blogdb')
  .then(() => console.log('DB ok'))
  .catch((error) => console.log('DB error', error));

const app = express();

app.use(express.json());

app.post('/auth/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new User({
      email: req.body.email,
      passwordHash: hash,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret-key',
      { expiresIn: '30d' }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: 'Не удалось зарегистрироваться',
    });
  }
});

app.listen(4444, (error) => {
  if (error) {
    return console.log(error);
  }
  console.log('Server OK');
});
