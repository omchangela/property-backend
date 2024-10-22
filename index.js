require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const { router: authRouter, verifyToken } = require('./routes/auth');
const Banner = require('./models/Banner');
const FormSubmission = require('./models/FormSubmission');

// Initialize the app
const app = express();
const port = process.env.PORT || 5050; // Use environment variable or default to 5050

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Use environment variable for frontend URL
    methods: ['GET', 'POST', 'DELETE'],
}));

app.use('/uploads', express.static('uploads')); // Serve the uploads directory
// Use auth routes
app.use('/api/auth', authRouter);

// Protected Admin Panel Route Example
app.get('/api/admin', verifyToken, (req, res) => {
    res.send('Welcome to the admin panel');
});

// Connect to MongoDB using the URI from the .env file
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// API: Submit form data
app.post('/api/form-submit', (req, res) => {
    const { name, mobile, email, location } = req.body;
    const formSubmission = new FormSubmission({ name, mobile, email, location });

    formSubmission.save()
        .then(() => res.status(200).send('Form submitted successfully!'))
        .catch(err => res.status(500).send('Error saving form data: ' + err));
});

// API: Get form submissions
app.get('/api/form-submissions', (req, res) => {
    FormSubmission.find()
        .then(submissions => res.json(submissions))
        .catch(err => res.status(500).send('Error fetching form submissions: ' + err));
});

// API: Upload banner image
app.post('/api/upload-banner', upload.single('banner'), (req, res) => {
    const imageUrl = `/uploads/${req.file.filename}`;

    const banner = new Banner({ imageUrl });
    banner.save()
        .then(() => res.json({ imageUrl }))
        .catch(err => res.status(500).send('Error saving banner image: ' + err));
});

// API: Get the latest banner image
app.get('/api/banner-image', (req, res) => {
    Banner.findOne().sort({ createdAt: -1 }) // Get the latest banner
        .then(banner => {
            if (banner) {
                res.json({ imageUrl: banner.imageUrl });
            } else {
                res.status(404).send('No banner images found.');
            }
        })
        .catch(err => res.status(500).send('Error fetching banner image: ' + err));
});

// API: Delete a banner image
app.delete('/api/banners/:id', (req, res) => {
    const bannerId = req.params.id;
    Banner.findByIdAndDelete(bannerId)
        .then(result => {
            if (result) {
                res.status(200).send('Banner deleted successfully!');
            } else {
                res.status(404).send('Banner not found.');
            }
        })
        .catch(err => res.status(500).send('Error deleting banner image: ' + err));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
