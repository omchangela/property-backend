const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
}, {
    timestamps: true // Automatically create createdAt and updatedAt fields
});

const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner;
