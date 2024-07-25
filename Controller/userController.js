const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = require('../Model/userSchema');
// const User = require('../models/User');

const JWT_SECRET = 'your_jwt_secret';

// User registration
exports.signUpUser = async (req, res) => {
  try {

    const { email, password, name } = req.body;
    console.log(email, password, name)
    if (!email || !password || !name)
      return res.status(400).json({ message: "email or password not found" })

    const userCheck = await userSchema.findOne({ email });
    if (userCheck)
      return res.status(400).json({ message: "User already exists" })

    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword
    const user = await userSchema(req.body).save();
    return res.status(200).json({
      data: user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// User login
exports.loginUser = async (req, res) => {
  try {

    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ message: "email or password not found" })
    const user = await userSchema.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      data: user,
      token
    });
  }
  catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}

