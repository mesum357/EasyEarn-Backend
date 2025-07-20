require('dotenv').config();
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const findOrCreate = require('mongoose-findorcreate');
const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');


// mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'massux357@gmail.com';

// Trust proxy for deployment platforms like Render
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    const allowedOrigins = [
      'https://easyearn-frontend4.vercel.app',
      'https://easyearn-backend-4.onrender.com',
      'https://easyearn-adminpanel2.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://127.0.0.1:8080',
      'http://192.168.1.7:8080', // Network access
      'http://192.168.1.7:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
const isLocalDev = !isProduction || process.env.FORCE_LOCAL_DEV === 'true';

console.log('Environment:', process.env.NODE_ENV);
console.log('Is Production:', isProduction);
console.log('Session Store URL:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600, // lazy session update
        autoRemove: 'native',
        ttl: 24 * 60 * 60 // 24 hours session TTL
    }),
    cookie: {
        secure: isProduction && !process.env.DISABLE_SECURE_COOKIES, // Use secure cookies only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? 'none' : 'lax' // Required for cross-origin cookies in production
    },
    name: 'connect.sid', // Use default session name for better compatibility
    proxy: isProduction // Trust proxy in production
}));

app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log session info
app.use((req, res, next) => {
  if (req.path !== '/api/my-participations' && req.path !== '/me') {
    console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID}, Authenticated: ${req.isAuthenticated()}, User: ${req.user ? req.user.username : 'none'}`);
  }
  next();
});

// Test endpoint to verify session functionality
app.get('/test-session', (req, res) => {
  if (!req.session.views) {
    req.session.views = 0;
  }
  req.session.views++;
  
  res.json({
    message: 'Session test',
    views: req.session.views,
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    cookieSecure: req.session.cookie.secure,
    cookieSameSite: req.session.cookie.sameSite
  });
});

// Temporary login endpoint with forced non-secure cookies for testing
app.post('/login-test', function(req, res, next) {
  console.log('Test login attempt for:', req.body.username);
  
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.verified) {
      return res.status(401).json({ error: 'Please verify your email before logging in.' });
    }
    
    req.logIn(user, function(err) {
      if (err) {
        console.error('req.logIn error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      // Force non-secure cookie for testing
      req.session.cookie.secure = false;
      req.session.cookie.sameSite = 'lax';
      
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
        console.log('Test login successful, session saved');
        console.log('Cookie settings:', {
          secure: req.session.cookie.secure,
          sameSite: req.session.cookie.sameSite,
          sessionID: req.sessionID
        });
        
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          user: { id: user._id, email: user.email, username: user.username },
          sessionID: req.sessionID
        });
      });
    });
  })(req, res, next);
});

// MONGOOSE
const mongooseOptions = {};

if (process.env.NODE_ENV === 'production') {
    mongooseOptions.ssl = true;
    mongooseOptions.tls = true;
    mongooseOptions.tlsAllowInvalidCertificates = true;
    mongooseOptions.tlsAllowInvalidHostnames = true;
}

// Get MongoDB URI from environment or use default
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
}

mongoose.connect(mongoURI, mongooseOptions)
    .then(() => {
        console.log("Connected to MongoDB ");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB Atlas:", err);
        process.exit(1);
    });

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    email: String,
    profileImage: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

// Passport configuration
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? "https://easyearn-backend-4.onrender.com/auth/google/homepage"
        : "http://localhost:3000/auth/google/homepage",
    passReqToCallback: true
},
async function(req, accessToken, refreshToken, profile, done) {
    try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                username: profile.emails[0].value,
                email: profile.emails[0].value
            });
        }
        
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// Set up layout


// Routes



function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
}

function ensureAuthenticatedRedirect(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login?error=Please login to access this page');
}

// Login page route
app.get('/login', function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send({
        value: req.isAuthenticated() ? 1 : 0,
        data: req.user,
        error: req.query.error,
        success: req.query.success
    });
});

// Register page route
app.get('/register', function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send({
        value: req.isAuthenticated() ? 1 : 0,
        data: req.user,
        error: req.query.error,
        success: req.query.success
    });
});

// Register API route
app.post("/register", async function(req, res) {
    const { username, password, confirmPassword, email } = req.body;
    console.log('Register request body:', req.body); // Log incoming data
    // Validation
    if (!username || !password || !confirmPassword || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    User.register({ username: email, email: email, verified: false, verificationToken }, password, async function(err, user) {
        if (err) {
            console.error('Registration error:', err); // Log registration errors
            let errorMessage = 'Registration failed';
            if (err.name === 'UserExistsError') {
                errorMessage = 'User already exists with this email';
            }
            return res.status(400).json({ error: errorMessage });
        }
        // Send verification email
        const verifyUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.username,
            subject: 'Verify your email for Smart Travel',
            html: `<h2>Welcome, ${user.username}!</h2><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
        });
        return res.status(201).json({ success: true, message: 'Registration successful! Please check your email to verify your account.' });
    });
});

app.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.redirect('/login?error=Invalid or missing verification token.');
    }
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        return res.redirect('/login?error=Invalid or expired verification token.');
    }
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    res.redirect('/login?success=Email verified! You can now log in.');
});

// Login API route
app.post("/login", function(req, res, next) {
    console.log('Login attempt for:', req.body.username);
    console.log('Session ID before login:', req.sessionID);
    console.log('Session before login:', req.session);
    
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            console.log('Login failed - user not found or invalid credentials');
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (!user.verified) {
            console.log('Login failed - user not verified');
            return res.status(401).json({ error: 'Please verify your email before logging in.' });
        }
        
        req.logIn(user, function(err) {
            if (err) {
                console.error('req.logIn error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            console.log('Login successful for:', user.username);
            console.log('Session ID after login:', req.sessionID);
            console.log('Session after login:', req.session);
            console.log('req.user after login:', req.user);
            console.log('req.isAuthenticated() after login:', req.isAuthenticated());
            
            return res.status(200).json({ 
                success: true, 
                message: 'Login successful', 
                user: { 
                    id: user._id, 
                    email: user.email, 
                    username: user.username 
                } 
            });
        });
    })(req, res, next);
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/homepage',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { 
            return res.status(500).json({ error: 'Logout failed' }); 
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get('/me', (req, res) => {
  console.log('/me endpoint hit - req.isAuthenticated():', req.isAuthenticated());
  console.log('/me endpoint hit - req.user:', req.user);
  console.log('/me endpoint hit - req.sessionID:', req.sessionID);
  console.log('/me endpoint hit - session:', req.session);
  console.log('/me endpoint hit - cookies:', req.headers.cookie);
  console.log('/me endpoint hit - origin:', req.headers.origin);
  console.log('/me endpoint hit - user-agent:', req.headers['user-agent']);
  console.log('/me endpoint hit - session store:', req.sessionStore ? 'exists' : 'missing');
  console.log('/me endpoint hit - cookie settings:', {
    secure: req.sessionStore.options?.cookie?.secure,
    httpOnly: req.sessionStore.options?.cookie?.httpOnly,
    sameSite: req.sessionStore.options?.cookie?.sameSite
  });
  
  if (req.isAuthenticated() && req.user) {
    res.json({ 
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Debug endpoint to test database connection
app.get('/debug/db', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const sessionCount = req.sessionStore ? 'Session store available' : 'No session store';
    
    res.json({
      database: 'Connected',
      userCount,
      sessionStore: sessionCount,
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      sessionSecret: process.env.SESSION_SECRET ? 'Set' : 'Not set'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Debug endpoint to check session
app.get('/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    cookies: req.headers.cookie
  });
});

// Forgot Password: Send reset link
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    // For security, always respond with success
    return res.status(200).json({ message: 'If your email is registered, you’ll receive a reset link shortly.' });
  }
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();
  // Send email
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`
  });
  res.status(200).json({ message: 'If your email is registered, you’ll receive a reset link shortly.' });
});

// Reset Password: Update password
app.post('/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }
  user.setPassword(password, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to reset password' });
    }
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password has been reset successfully' });
  });
});

// Participation Schema
const participationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  prizeId: { type: Number, required: true },
  prizeTitle: { type: String, required: true },
  walletAddress: { type: String, required: true },
  receiptUrl: { type: String, required: true },
  submittedButton: { type: Boolean, default: null }, // null means pending, true means approved, false means rejected
  createdAt: { type: Date, default: Date.now }
});
const Participation = mongoose.model('Participation', participationSchema);

// Fund Request Schema
const fundRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  receiptUrl: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const FundRequest = mongoose.model('FundRequest', fundRequestSchema);

// Save participation entry
app.post('/api/participate', ensureAuthenticated, async (req, res) => {
  try {
    console.log('Participate: req.user =', req.user);
    const { prizeId, prizeTitle, walletAddress, receiptUrl } = req.body;
    const userId = req.user ? req.user._id : null;
    
    // Check if user already has a participation for this prize
    const existingParticipation = await Participation.findOne({ user: userId, prizeId });
    
    if (existingParticipation) {
      // Update existing participation
      existingParticipation.prizeTitle = prizeTitle;
      existingParticipation.walletAddress = walletAddress;
      existingParticipation.receiptUrl = receiptUrl;
      existingParticipation.submittedButton = null; // Reset to pending
      existingParticipation.createdAt = new Date();
      await existingParticipation.save();
      console.log('Updated participation:', existingParticipation);
      res.status(201).json({ success: true, participation: existingParticipation });
    } else {
      // Create new participation
      const participation = new Participation({
        user: userId,
        prizeId,
        prizeTitle,
        walletAddress,
        receiptUrl,
        submittedButton: null // null means pending approval
      });
      await participation.save();
      console.log('Saved participation:', participation);
      res.status(201).json({ success: true, participation });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to save participation', details: err.message });
  }
});

// Save fund request
app.post('/api/fund-request', ensureAuthenticated, async (req, res) => {
  try {
    const { receiptUrl } = req.body;
    const userId = req.user ? req.user._id : null;
    const fundRequest = new FundRequest({
      user: userId,
      receiptUrl
    });
    await fundRequest.save();
    res.status(201).json({ success: true, fundRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save fund request', details: err.message });
  }
});

// Get participations for the current user (or all for testing if not logged in)
app.get('/api/my-participations', async (req, res) => {
  try {
    console.log('my-participations: req.user =', req.user);
    if (!req.user) {
      // Not authenticated, return empty array
      return res.json({ participations: [] });
    }
    const userId = req.user._id;
    const participations = await Participation.find({ user: userId }).sort({ createdAt: -1 });
    // Only keep the latest participation per prizeId
    const latestByPrize = {};
    participations.forEach(p => {
      if (!latestByPrize[p.prizeId]) {
        latestByPrize[p.prizeId] = p;
      }
    });
    res.json({ participations: Object.values(latestByPrize) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch participations', details: err.message });
  }
});

// Admin: Get all participation requests
app.get('/api/admin/participations', async (req, res) => {
  try {
    const participations = await Participation.find({}).populate('user');
    res.json({ participations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch participations', details: err.message });
  }
});

// Admin: Approve or reject a participation
app.post('/api/admin/participations/:id/approve', async (req, res) => {
  try {
    const participation = await Participation.findByIdAndUpdate(
      req.params.id,
      { submittedButton: true },
      { new: true }
    );
    res.json({ success: true, participation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve participation', details: err.message });
  }
});

app.post('/api/admin/participations/:id/reject', async (req, res) => {
  try {
    const participation = await Participation.findByIdAndUpdate(
      req.params.id,
      { submittedButton: false },
      { new: true }
    );
    res.json({ success: true, participation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject participation', details: err.message });
  }
});

// Admin: Get all users with pagination
app.get('/api/admin/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination info
    const total = await User.countDocuments({});
    
    // Get paginated users
    const users = await User.find({}, '-password -resetPasswordToken -resetPasswordExpires -verificationToken')
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({ 
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

// Admin: Create notification
app.post('/api/admin/notifications', async (req, res) => {
  try {
    const { title, message } = req.body;
    const notification = new Notification({ title, message });
    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification', details: err.message });
  }
});

// Get all notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the file URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});