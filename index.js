require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const { router: authRouter, verifyToken } = require('./routes/auth');
const Banner = require('./models/Banner');
const FormSubmission = require('./models/FormSubmission');
const CostCalculator = require('./models/CostCalculator'); // Import CostCalculator

// Initialize the app
const app = express();
const port = process.env.PORT || 5050; // Use environment variable or default to 5050

// Middleware
app.use(express.json());

// Middleware for handling CORS
app.use(cors({
    origin: 'https://www.makemybuild.in',  // Allow only this specific origin
    methods: ['GET', 'POST', 'DELETE'],    // Define allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true                      // Allow credentials if needed (cookies, auth headers)
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

// API: Delete a form submission
app.delete('/api/form-submissions/:id', (req, res) => {
    const submissionId = req.params.id;
    FormSubmission.findByIdAndDelete(submissionId)
        .then(result => {
            if (result) {
                res.status(200).send('Form submission deleted successfully!');
            } else {
                res.status(404).send('Form submission not found.');
            }
        })
        .catch(err => res.status(500).send('Error deleting form submission: ' + err));
});

// API: Submit cost calculator form data
app.post('/api/cost-calculator', (req, res) => {
    const { name, mobile, location, area, carParking, balconyUtilityArea, package, city } = req.body;

    // Create a new CostCalculator document using the form data
    const costCalculatorData = new CostCalculator({
        name,
        mobile,
        location,
        area,
        carParking,
        balconyUtilityArea,
        package,
        city
    });

    // Save the data in the database
    costCalculatorData.save()
        .then(() => res.status(200).send('Cost calculator form submitted successfully!'))
        .catch(err => res.status(500).send('Error saving cost calculator data: ' + err));
});

// API: Get all cost calculator submissions (if needed)
app.get('/api/cost-calculator-submissions', (req, res) => {
    CostCalculator.find()
        .then(submissions => res.json(submissions))
        .catch(err => res.status(500).send('Error fetching cost calculator submissions: ' + err));
});

// API: Upload banner image
app.post('/api/upload-banner', upload.single('banner'), (req, res) => {
    const imageUrl = `/uploads/${req.file.filename}`;

    const banner = new Banner({ imageUrl });
    banner.save()
        .then(() => res.json({ imageUrl }))
        .catch(err => res.status(500).send('Error saving banner image: ' + err));
});

// API: Get the latest 3 banner images
app.get('/api/banner-images', (req, res) => {
    Banner.find().sort({ createdAt: -1 }).limit(3) // Get the latest 3 banners
        .then(banners => {
            if (banners && banners.length > 0) {
                const imageUrls = banners.map(banner => banner.imageUrl); // Extract image URLs
                res.json({ imageUrls });
            } else {
                res.status(404).send('No banner images found.');
            }
        })
        .catch(err => res.status(500).send('Error fetching banner images: ' + err));
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
