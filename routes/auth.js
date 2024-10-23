const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();
const secretKey = 'makemybuild@123'; // Replace with your own secret key

// Register a new user
router.post('/register', [
    // Validate input data
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }

    const { email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already registered'); // Inform user email is taken
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error during registration:', error); // Log the error for debugging
        res.status(500).send('Error registering user: ' + error.message);
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid email or password');
        }

        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error); // Log the error for debugging
        res.status(500).send('Error logging in: ' + error.message);
    }
});

// Middleware to verify the token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
    if (!token) {
        return res.status(403).send('Access denied');
    }
    
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).send('Invalid token');
        }
        req.userId = decoded.id; // Save the user ID from the token
        next();
    });
};

module.exports = { router, verifyToken };
