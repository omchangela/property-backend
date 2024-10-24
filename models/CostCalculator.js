const mongoose = require('mongoose');

// Define the schema for the CostCalculator form
const costCalculatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Validate for 10-digit mobile number
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: [1, 'Area must be greater than 0']
  },
  carParking: {
    type: Number,
    required: true,
    min: [0, 'Car parking spaces cannot be negative']
  },
  balconyUtilityArea: {
    type: Number,
    required: true,
    min: [0, 'Balcony & utility area must be at least 0']
  },
  package: {
    type: String,
    enum: ['Basic Package (Incl. GST)', 'Premium Package (Incl. GST)', 'Luxury Package (Incl. GST)'],
    default: 'Basic Package (Incl. GST)'
  },
  city: {
    type: String,
    enum: ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata'],
    default: 'Bengaluru'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the model for the schema
const CostCalculator = mongoose.model('CostCalculator', costCalculatorSchema);

module.exports = CostCalculator;
