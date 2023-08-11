const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors =require('cors')
const CarWashRoutes=require('./BookingFunction/CarWashRoutes')
const bookingHistoryRoutes = require('./BookingFunction/BookingHistoryRoutes'); // Import your new API route

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = ['http://localhost:3000', 'http://example2.com'];
app.use(
  cors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Connect to MongoDB
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Create a user schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  otp: String,
  verified: Boolean,
  tokens: [String],

});
const User = mongoose.model('User', userSchema);


// Middleware
app.use(bodyParser.json());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    host: "smtp.eu.mailgun.org", // Update with your SMTP host
    port: 587, // Update with the SMTP port
    secure: false,
  auth: {
    user: "postmaster@techarman.me", // Update with your email
    pass: "arman821", // Update with your password
  },
});

// Signup endpoint with OTP verification
app.post('/signup', async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
  
      // Check for required fields
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'Please provide all required information' });
      }
  
      // Generate and save OTP
      const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
      const newUser = new User({ name, email, phone, password, otp, verified: false });
      await newUser.save();
  
      // Send OTP via email
      const mailOptions = {
        from: 'verify@techarman.me', // Update with your email
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for verification is: ${otp}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
          res.status(500).json({ error: 'An error occurred while sending OTP email' });
        } else {
          console.log('Email sent:', info.response);
          res.status(201).json({ message: 'OTP sent successfully' });
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error (unique index violation)
        return res.status(409).json({ error: 'Email or phone number is already registered' });
      }
  
      console.error('Signup error:', error);
      res.status(500).json({ error: 'An error occurred while signing up' });
    }
  });
// Verify OTP and update user as verified
app.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp });

    if (user) {
      user.verified = true;
      await user.save();
      res.json({ message: 'OTP verification successful' });
      const mailOptions = {
        from: 'verify@techarman.me', // Update with your email
        to: email,
        subject: 'Welcome',
        text: `Hey ${email} Welcome to our website`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
          res.status(500).json({ error: 'An error occurred while sending OTP email' });
        } else {
          console.log('Email sent:', info.response);
          res.status(201).json({ message: 'OTP sent successfully' });
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while verifying OTP' });
  }
});


  
// ... (other imports and configurations)

// Login endpoint
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (user && user.password === password && user.verified) {
        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, "armanmondal", { expiresIn: '1h' });
  
        // Store the token in the user's tokens array
        user.tokens.push(token);
        await user.save();
  
        res.json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ error: 'Invalid credentials or unverified account' });
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while logging in' });
    }
  });
// Middleware to verify token and protect routes
async function verifyToken(req, res, next) {
    const token = req.header('Authorization');
  
    if (!token) {
      return res.status(401).json({ error: 'Access denied, missing token' });
    }
  
    try {
      const user = await User.findOne({ tokens: token });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
  
      req.userId = user._id;
      req.name=user.name;
      req.email=user.email;
      req.phone=user.phone;
      next();
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while verifying token' });
    }
  }
  app.get('/dashboard', verifyToken, (req, res) => {
    // You can use req.userId to fetch user-specific data from the database
    res.json({name: req.name,email:req.email,phone:req.phone})
  });
  
app.use('/api', bookingHistoryRoutes); // Use your new API route

app.use('/api', CarWashRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
