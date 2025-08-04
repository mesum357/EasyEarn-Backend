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

// Email testing flag - set to true to disable email sending for testing
const DISABLE_EMAILS = process.env.DISABLE_EMAILS === 'true' || true; // Currently disabled for testing

// Log email status on startup
console.log(`📧 Email sending is ${DISABLE_EMAILS ? 'DISABLED' : 'ENABLED'} for testing`);

// Trust proxy for deployment platforms like Render
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Define allowed origins based on environment
const allowedOrigins = [
  // Production URLs
  'https://easyearn-frontend4.vercel.app',
  'https://easyearn-frontend8.vercel.app',  // Added newer frontend domain
  'https://easyearn-frontend5-5s029wzy7-ahmads-projects-9a0217f0.vercel.app', // Preview deployment
  'https://easyearn-adminpanel2.vercel.app',
  // Railway deployments
  'https://caring-meat-production.up.railway.app', // Admin Dashboard
  'https://easyearn-frontend-production.up.railway.app', // Main Frontend
  'https://easyearn-frontend-production-760e.up.railway.app', // Previous Frontend URL
  'https://easyearn-frontend-production-5a04.up.railway.app', // Current Frontend URL
  'https://gleaming-miracle-production.up.railway.app', // Project Frontend URL
  'https://easyearn-adminpanel-production.up.railway.app', // Railway Admin Panel
  'https://easyearn-adminpanel-production.up.railway.app/', // Railway Admin Panel with slash
  // Backend (for API docs or testing)
  'https://easyearn-backend-4.onrender.com',
  'https://easyearn-backend-production.up.railway.app', // Railway backend URL
  // Development origins
  'http://localhost:3000',
  'http://localhost:3005',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  // Network testing
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3005',
  'http://192.168.1.7:8080',
  'http://192.168.1.7:3000',
  // VPS IP addresses
  'http://31.97.39.46:8080',
  'http://31.97.39.46:3000',
];

// Log allowed origins for debugging
console.log(`CORS configured with ${allowedOrigins.length} allowed origins:`);
allowedOrigins.forEach(origin => console.log(` - ${origin}`));

// Configure CORS with proper settings for credentials
app.use(cors({
  origin: function(origin, callback) {
    // Handle requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) {
      console.log('Request with no origin - allowing access');
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS allowed origin: ${origin}`);
      return callback(null, origin); // Return the specific origin that was allowed
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      // Instead of throwing an error, just reject with false
      return callback(null, false);
    }
  },
  credentials: true, // Critical for cookies and authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
  exposedHeaders: ['Set-Cookie'], // Allow frontend to see Set-Cookie header
  maxAge: 86400, // Cache preflight request results for 1 day (in seconds)
  optionsSuccessStatus: 200 // Some legacy browsers (IE11) choke on 204
}));

// Handle preflight OPTIONS requests
app.options('*', function(req, res) {
  console.log('OPTIONS request received from origin:', req.headers.origin);
  console.log('OPTIONS request path:', req.path);
  
  // Set appropriate CORS headers
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    // Set explicit CORS headers for proper cross-domain cookie handling
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie'); // Important for cookie handling
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(200).end();
  } else {
    console.log('OPTIONS request blocked due to origin not allowed:', origin);
    res.status(403).json({ error: 'CORS not allowed for this origin' });
  }
});

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
const isLocalDev = !isProduction || process.env.FORCE_LOCAL_DEV === 'true';

console.log('Environment:', process.env.NODE_ENV);
console.log('Is Production:', isProduction);
console.log('Session Store URL:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

// Clean up any existing sessions for the same user
const sessionCleanup = async (userId) => {
  try {
    const sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    });
    
    // We can't directly access session data by user ID because it's serialized
    // This is a placeholder for potential future implementation
    console.log(`Session cleanup requested for user ID: ${userId}`);
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
};

// Define cookie settings based on environment
const cookieSettings = {
  // Always set httpOnly for security
  httpOnly: true,
  // Session lifetime from env or default to 24 hours
  maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
  // Set path to root to ensure cookie is available across the site
  path: '/',
};

// Log session lifetime for debugging
const sessionHours = cookieSettings.maxAge / (1000 * 60 * 60);
console.log(`Session lifetime: ${sessionHours} hours (${cookieSettings.maxAge}ms)`);

// Always use SameSite=None in production for cross-origin cookie sharing
// This is CRITICAL when frontend and backend are on different domains
if (isProduction) {
  cookieSettings.sameSite = 'none';
  cookieSettings.secure = true;
  console.log('Production environment: Using secure cookies with SameSite=None for cross-origin support');
} else {
  // In development, we can be more flexible
  if (process.env.DISABLE_SECURE_COOKIES === 'true') {
    cookieSettings.sameSite = 'lax';
    cookieSettings.secure = false;
    console.log('Development environment: Using insecure cookies with SameSite=Lax');
  } else {
    cookieSettings.sameSite = 'none';
    cookieSettings.secure = true;
    console.log('Development environment: Using secure cookies with SameSite=None');
  }
}

// Log the cookie settings
console.log('Cookie settings:', cookieSettings);

// Domain setting (optional) - if you want to share cookies across subdomains
if (process.env.COOKIE_DOMAIN) {
  cookieSettings.domain = process.env.COOKIE_DOMAIN;
  console.log('Setting cookie domain:', process.env.COOKIE_DOMAIN);
}

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: 'sessions',
  touchAfter: 24 * 3600, // lazy session update
  autoRemove: 'native',
  ttl: 24 * 60 * 60, // 24 hours session TTL
  stringify: false, // Don't stringify session data for better debugging
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: cookieSettings,
    name: process.env.SESSION_NAME || 'easyearn.sid', // Custom session name from env
    proxy: isProduction // Trust proxy in production
}));

// Get session name for logging and reference
const sessionName = process.env.SESSION_NAME || 'easyearn.sid';

// Log session store configuration
console.log('Session store configured with options:', {
  collectionName: 'sessions',
  ttl: '24 hours',
  cookie: cookieSettings,
  sessionName: 'easyearn.sid'
});

app.use(passport.initialize());
app.use(passport.session());

// Error handling for unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash the server, just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't crash the server, just log the error
});

// Debug middleware to log session info (reduced logging)
app.use((req, res, next) => {
  // Only log non-frequent endpoints and exclude health checks
  if (req.path !== '/api/my-participations' && 
      req.path !== '/me' && 
      req.path !== '/api/notifications' && 
      req.path !== '/health') {
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
    balance: {
        type: Number,
        default: 0
    },
    hasDeposited: {
        type: Boolean,
        default: false
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
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

// Referral Schema
const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referred: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Referral = mongoose.model('Referral', referralSchema);

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
            // Generate referral code for new Google users
            const referralCode = generateReferralCode();
            
            user = await User.create({
                googleId: profile.id,
                username: profile.emails[0].value,
                email: profile.emails[0].value,
                referralCode: referralCode,
                verified: true // Google users are pre-verified
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
    console.log('🔐 ensureAuthenticated called for:', req.path);
    console.log('Session ID:', req.sessionID);
    console.log('Is authenticated:', req.isAuthenticated());
    console.log('User:', req.user ? req.user.username : 'none');
    console.log('Session exists:', !!req.session);
    console.log('Session user:', req.session?.user);
    
    if (req.isAuthenticated()) {
        console.log('✅ Authentication successful, proceeding');
        return next();
    }
    console.log('❌ Authentication failed, returning 401');
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
    
    // Check if there's a referral code in the query
    const referralCode = req.query.ref;
    
    res.send({
        value: req.isAuthenticated() ? 1 : 0,
        data: req.user,
        error: req.query.error,
        success: req.query.success,
        referralCode: referralCode || null
    });
});

// Frontend signup route (for referral links)
app.get('/signup', function(req, res) {
    // Redirect to the frontend signup page with referral code
    const referralCode = req.query.ref;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const redirectUrl = referralCode ? `${frontendUrl}/signup?ref=${referralCode}` : `${frontendUrl}/signup`;
    res.redirect(redirectUrl);
});

// Register API route
app.post("/register", async function(req, res) {
    const { username, password, confirmPassword, email, referralCode } = req.body;
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

    try {
        // Check if referral code is valid (can be either referral code or user ID)
        let referrer = null;
        if (referralCode) {
            // First try to find by user ID (for new referral system)
            if (referralCode.length === 24) { // MongoDB ObjectId length
                referrer = await User.findById(referralCode);
            }
            // If not found by ID, try by referral code (for backward compatibility)
            if (!referrer) {
                referrer = await User.findOne({ referralCode: referralCode });
            }
            if (!referrer) {
                return res.status(400).json({ error: 'Invalid referral code' });
            }
        }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
        
        User.register({ 
            username: email, 
            email: email, 
            verified: DISABLE_EMAILS ? true : false, // Auto-verify for testing when emails are disabled
            verificationToken: DISABLE_EMAILS ? undefined : verificationToken,
            referredBy: referrer ? referrer._id : null
        }, password, async function(err, user) {
        if (err) {
            console.error('Registration error:', err); // Log registration errors
            let errorMessage = 'Registration failed';
            if (err.name === 'UserExistsError') {
                errorMessage = 'User already exists with this email';
            }
            return res.status(400).json({ error: errorMessage });
        }

            // Generate unique referral code for the new user
            const userReferralCode = generateReferralCode();
            user.referralCode = userReferralCode;
            await user.save();

            // Create referral record if user was referred
            if (referrer) {
                const referral = new Referral({
                    referrer: referrer._id,
                    referred: user._id,
                    status: DISABLE_EMAILS ? 'completed' : 'pending' // Auto-complete for testing when emails are disabled
                });
                await referral.save();
                
                // Log referral completion for testing
                if (DISABLE_EMAILS) {
                    console.log(`📧 EMAIL DISABLED: Referral auto-completed - ${referrer.username} referred ${user.username}`);
                }
            }

                                // Send verification email
            const verifyUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verificationToken}`;
            
            if (DISABLE_EMAILS) {
                console.log('📧 EMAIL DISABLED: Would send verification email to:', user.username);
                console.log('📧 Verification URL:', verifyUrl);
            } else {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.username,
                    subject: 'Verify your email for EasyEarn',
                    html: `<h2>Welcome, ${user.username}!</h2><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
                });
            }
        
        // Keep user unverified until they click the verification link
        // user.verified = true; // REMOVED: Auto-verification
        // user.verificationToken = undefined; // REMOVED: Keep token for verification
        // await user.save(); // REMOVED: Don't save auto-verification
            
            return res.status(201).json({ 
                success: true, 
                message: DISABLE_EMAILS 
                    ? 'Registration successful! Your account has been automatically verified for testing. You can now log in.'
                    : 'Registration successful! Please check your email to verify your account. Referral bonus will be given after email verification.',
                referralCode: userReferralCode,
                autoVerified: DISABLE_EMAILS
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
});

// Function to generate unique referral code
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Function to check and complete referrals when a user deposits $10
async function checkAndCompleteReferrals(userId) {
    try {
        const user = await User.findById(userId);
        if (!user || !user.hasDeposited) {
            return; // User hasn't deposited $10 yet
        }

        // Find all pending referrals for this user
        const pendingReferrals = await Referral.find({
            referred: userId,
            status: 'pending'
        });

        for (const referral of pendingReferrals) {
            // Update referral status to completed
            referral.status = 'completed';
            await referral.save();
            
            console.log(`Referral completed: User ${user.username} (${userId}) has deposited $10, completing referral from ${referral.referrer}`);
        }
    } catch (error) {
        console.error('Error checking and completing referrals:', error);
    }
}

app.get('/verify-email', async (req, res) => {
    const { token, error, success } = req.query;
    
    // If there's an error or success parameter, just serve the frontend page
    if (error || success) {
        // For now, just redirect to the frontend URL
        return res.redirect('http://localhost:3005/verify-email?' + new URLSearchParams(req.query).toString());
    }
    
    // If there's a token, verify it and redirect with result
    if (token) {
        try {
            console.log('Verifying token:', token);
            const user = await User.findOne({ verificationToken: token });
            console.log('User found:', user ? 'Yes' : 'No');
            if (user) {
                console.log('User email:', user.email);
                console.log('User verified status:', user.verified);
            }
            
            if (!user) {
                console.log('No user found with this verification token');
                return res.redirect('http://localhost:3005/verify-email?error=Invalid or expired verification token.');
            }
            
            // Check if user is already verified
            if (user.verified) {
                return res.redirect('http://localhost:3005/verify-email?success=Email already verified! You can now log in.');
            }
            
            user.verified = true;
            user.verificationToken = undefined;
            await user.save();
            
            // Handle referral - keep as pending until user deposits $10
            if (user.referredBy) {
                const referral = await Referral.findOne({ 
                    referrer: user.referredBy, 
                    referred: user._id,
                    status: 'pending'
                });
                if (referral && user.hasDeposited) { // Check if user has deposited $10
                    referral.status = 'completed'; // Update referral status to completed
                    await referral.save();
                    console.log(`Referral completed: ${user.referredBy} referred ${user.username} deposit $10`);
                } else if (referral) {
                    // Keep referral as pending - will be completed when user deposits $10
                    console.log(`Referral created: ${user.referredBy} referred ${user.username} - status: pending (waiting for $10 deposit)`);
                }
            }
    
    res.redirect('http://localhost:3005/verify-email?success=Email verified successfully! You can now log in.');
        } catch (error) {
            console.error('Email verification error:', error);
            res.redirect('http://localhost:3005/verify-email?error=Verification failed. Please try again.');
        }
    } else {
        // No token, no error, no success - redirect to frontend
        res.redirect('http://localhost:3005/verify-email');
    }
});

// Login API route
app.post("/login", function(req, res, next) {
    console.log('Login attempt for:', req.body.username);
    console.log('Session ID before login:', req.sessionID);
    console.log('Request cookies:', req.headers.cookie);
    console.log('Request origin:', req.headers.origin);
    
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
        
        // Regenerate session to prevent session fixation attacks
        req.session.regenerate(function(err) {
            if (err) {
                console.error('Session regeneration error:', err);
                return res.status(500).json({ error: 'Session error' });
            }
            
            // Log in the user
        req.logIn(user, function(err) {
            if (err) {
                    console.error('req.logIn error:', err);
                    return res.status(500).json({ error: 'Authentication error' });
                }
                
                // Make sure session data is saved before sending response
                req.session.userId = user._id; // Store user ID explicitly in session
                req.session.loginTime = new Date().toISOString();
                
                // Save session explicitly to ensure it's stored in the database
                req.session.save(function(err) {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).json({ error: 'Session storage error' });
                    }
                    
                    console.log('Login successful for:', user.username);
                    console.log('Session ID after login:', req.sessionID);
                    console.log('User authenticated:', req.isAuthenticated());
                    console.log('Session cookie:', req.session.cookie);
                    
                    // Get session expiration date in human-readable format
                    const expiresAt = new Date(Date.now() + req.session.cookie.maxAge);
                    console.log('Session expires at:', expiresAt.toISOString());
                    
                    // Add session expiration info to the response
                    return res.status(200).json({ 
                        success: true, 
                        message: 'Login successful', 
                        user: { 
                            _id: user._id, 
                            email: user.email, 
                            username: user.username 
                        },
                        session: {
                            id: req.sessionID,
                            expiresAt: expiresAt.toISOString()
                        }
                    });
                });
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
    // Save user info for logging
    const username = req.user ? req.user.username : 'unknown';
    const sessionID = req.sessionID;
    
    console.log(`Logout request from ${username} with session ${sessionID}`);
    
    // First, log the user out (clear req.user and remove login session)
    req.logout(function(logoutErr) {
        if (logoutErr) { 
            console.error('Logout error:', logoutErr);
            return res.status(500).json({ error: 'Logout failed' }); 
        }
        
        // Then destroy the session completely
        req.session.destroy(function(destroyErr) {
            if (destroyErr) {
                console.error('Session destruction error:', destroyErr);
                return res.status(500).json({ error: 'Session destruction failed' });
            }
            
            console.log(`User ${username} successfully logged out. Session ${sessionID} destroyed.`);
            
            // Clear the session cookie using the configured name
            res.clearCookie(sessionName);
            
            // Return success response
            res.json({ 
                success: true, 
                message: 'Logged out successfully',
                sessionDestroyed: true
            });
        });
    });
});

app.get('/me', async (req, res) => {
  console.log('/me endpoint hit - headers:', {
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    accept: req.headers.accept
  });
  
  console.log('/me endpoint hit - session info:', {
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!req.user,
    hasSession: !!req.session,
    hasCookies: !!req.headers.cookie
  });
  
  if (req.headers.cookie) {
    console.log('/me endpoint hit - cookies:', req.headers.cookie);
  }
  
  // Enhanced authentication check using both Passport and session data
  if (req.isAuthenticated() && req.user) {
    // Log successful authentication
    console.log('👤 /me endpoint - User authenticated:', req.user.username);
    console.log(`   User ID: ${req.user._id}`);
    console.log(`   Balance: $${req.user.balance || 0}`);
    console.log(`   hasDeposited: ${req.user.hasDeposited || false}`);
    console.log(`   Tasks Status: ${(req.user.hasDeposited || false) ? '🔓 UNLOCKED' : '🔒 LOCKED'}`);
    
    // Touch the session to reset expiration time
    req.session.touch();
    
    // Return user info
    return res.json({ 
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        balance: req.user.balance || 0,
        hasDeposited: req.user.hasDeposited || false,
        referralCode: req.user.referralCode
      },
      sessionId: req.sessionID
    });
  } else if (req.session && req.session.userId) {
    // Fallback: check if we have userId in session but Passport authentication failed
    try {
      // Try to retrieve user from database directly
      const user = await User.findById(req.session.userId);
      if (user) {
        console.log('🔄 /me endpoint - Session user found, but Passport auth failed. Restoring session for:', user.username);
        console.log(`   User ID: ${user._id}`);
        console.log(`   Balance: $${user.balance || 0}`);
        console.log(`   hasDeposited: ${user.hasDeposited || false}`);
        console.log(`   Tasks Status: ${(user.hasDeposited || false) ? '🔓 UNLOCKED' : '🔒 LOCKED'}`);
        
        // Re-establish authentication
        req.login(user, (err) => {
          if (err) {
            console.error('❌ Error re-establishing authentication:', err);
            return res.status(401).json({ error: 'Session recovery failed' });
          }
          
          console.log('✅ Session recovery successful for user:', user.username);
          // Return user info
          return res.json({ 
            user: {
              _id: user._id,
              username: user.username,
              email: user.email,
              balance: user.balance || 0,
              hasDeposited: user.hasDeposited || false,
              referralCode: user.referralCode
            },
            sessionId: req.sessionID,
            recovered: true
          });
        });
  } else {
        console.log('/me endpoint - Session user ID present but user not found in database');
        return res.status(401).json({ error: 'Not authenticated' });
      }
    } catch (error) {
      console.error('/me endpoint - Error looking up session user:', error);
      return res.status(401).json({ error: 'Not authenticated' });
    }
  } else {
    // Not authenticated
    console.log('/me endpoint - User not authenticated');
    return res.status(401).json({ 
      error: 'Not authenticated',
      sessionPresent: !!req.session,
      cookiesPresent: !!req.headers.cookie
    });
  }
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Health check endpoint - useful for testing CORS and connectivity
app.get('/health', (req, res) => {
  const sessionActive = req.session && req.sessionID;
  const userAuthenticated = req.isAuthenticated();
  
  // Log request details for debugging
  console.log('Health check request from:', req.headers.origin);
  console.log('Health check session:', sessionActive ? 'active' : 'inactive');
  console.log('Health check user:', userAuthenticated ? 'authenticated' : 'unauthenticated');
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    session: {
      active: sessionActive,
      id: req.sessionID || null
    },
    auth: {
      authenticated: userAuthenticated,
      user: userAuthenticated ? req.user.username : null
    },
    cors: {
      origin: req.headers.origin || 'not specified',
      allowedOrigins: allowedOrigins.slice(0, 10) // Show first 10 allowed origins
    }
  });
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

// Cookie debug endpoint
app.get('/debug/cookies', (req, res) => {
  // Set a test cookie
  res.cookie('test_cookie', 'cookie_value', {
    httpOnly: true,
    secure: cookieSettings.secure,
    sameSite: cookieSettings.sameSite,
    maxAge: 3600000 // 1 hour
  });
  
  // Return information about the cookie settings
  res.json({
    message: 'Test cookie set',
    cookieSettings: {
      secure: cookieSettings.secure,
      sameSite: cookieSettings.sameSite,
      httpOnly: cookieSettings.httpOnly,
      path: cookieSettings.path || '/',
      domain: cookieSettings.domain || 'not set'
    },
    requestCookies: req.headers.cookie || 'no cookies in request',
    sessionID: req.sessionID || 'no session ID',
    environment: process.env.NODE_ENV || 'development'
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
    return res.status(200).json({ message: 'If your email is registered, you\'ll receive a reset link shortly.' });
  }
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();
  // Send email
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  if (DISABLE_EMAILS) {
    console.log('📧 EMAIL DISABLED: Would send password reset email to:', user.email);
    console.log('📧 Reset URL:', resetUrl);
  } else {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`
    });
  }
  res.status(200).json({ message: 'If your email is registered, you\'ll receive a reset link shortly.' });
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
  prizeId: { type: Number, required: false }, // For legacy participations
  prizeTitle: { type: String, required: false }, // For legacy participations
  binanceUID: { type: String, required: false }, // For legacy participations
  receiptUrl: { type: String, required: false }, // For legacy participations
  luckyDrawId: { type: mongoose.Schema.Types.ObjectId, ref: 'LuckyDraw', required: false }, // For new lucky draw participations
  walletAddress: { type: String, required: false }, // For new lucky draw participations
  submittedButton: { type: Boolean, default: null }, // null means pending, true means approved, false means rejected
  createdAt: { type: Date, default: Date.now }
});
const Participation = mongoose.model('Participation', participationSchema);

// Lucky Draw Schema
const luckyDrawSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  prize: { type: String, required: true },
  entryFee: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
  currentParticipants: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['scheduled', 'active', 'paused', 'completed'], 
    default: 'scheduled' 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
const LuckyDraw = mongoose.model('LuckyDraw', luckyDrawSchema);

// Fund Request Schema
const fundRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  receiptUrl: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const FundRequest = mongoose.model('FundRequest', fundRequestSchema);

// Deposit Schema
const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    required: false
  },
  receiptUrl: {
    type: String,
    required: false
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date
});

const Deposit = mongoose.model('Deposit', depositSchema);

// Withdrawal Requirements Schema
const withdrawalRequirementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  requirements: {
    referrals: {
      required: { type: Number, default: 2 },
      completed: { type: Number, default: 0 },
      met: { type: Boolean, default: false }
    },
    deposit: {
      required: { type: Number, default: 10 },
      completed: { type: Number, default: 0 },
      met: { type: Boolean, default: false }
    },
    luckyDraw: {
      required: { type: Number, default: 1 },
      completed: { type: Number, default: 0 },
      met: { type: Boolean, default: false }
    }
  },
  allRequirementsMet: {
    type: Boolean,
    default: false
  },
  balanceReset: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const WithdrawalRequirement = mongoose.model('WithdrawalRequirement', withdrawalRequirementSchema);

// Withdrawal Request Schema
const withdrawalRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  processedAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

// Save participation entry
app.post('/api/participate', ensureAuthenticated, async (req, res) => {
  try {
    console.log('Participate: req.user =', req.user);
    const { prizeId, prizeTitle, binanceUID, receiptUrl } = req.body;
    const userId = req.user ? req.user._id : null;
    
    // Check if user already has a participation for this prize
    const existingParticipation = await Participation.findOne({ user: userId, prizeId });
    
    if (existingParticipation) {
      // Update existing participation
      existingParticipation.prizeTitle = prizeTitle;
      existingParticipation.binanceUID = binanceUID;
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
        binanceUID,
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

// Create deposit request
app.post('/api/deposits', ensureAuthenticated, async (req, res) => {
  try {
    const { amount, receiptUrl, transactionHash, notes } = req.body;
    const userId = req.user._id;

    console.log(`💰 DEPOSIT REQUEST: User ${req.user.username} (${userId}) submitting deposit request`);
    console.log(`   Amount: $${amount}`);
    console.log(`   Receipt URL: ${receiptUrl}`);
    console.log(`   Transaction Hash: ${transactionHash}`);
    console.log(`   Notes: ${notes}`);

    // Validate amount
    if (!amount || amount < 10) {
      console.log(`❌ DEPOSIT REJECTED: Amount $${amount} is below minimum $10`);
      return res.status(400).json({ 
        success: false, 
        error: 'Minimum deposit amount is $10' 
      });
    }

    // Create deposit record
    const deposit = new Deposit({
      userId,
      amount,
      receiptUrl,
      transactionHash,
      notes
    });

    await deposit.save();

    console.log(`✅ DEPOSIT REQUEST CREATED: Deposit ID ${deposit._id} saved successfully`);
    console.log(`   User: ${req.user.username}`);
    console.log(`   Amount: $${amount}`);
    console.log(`   Status: ${deposit.status}`);
    console.log(`   Created At: ${deposit.createdAt}`);

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted successfully',
      deposit: {
        id: deposit._id,
        amount: deposit.amount,
        status: deposit.status,
        createdAt: deposit.createdAt
      }
    });

  } catch (error) {
    console.error('❌ ERROR CREATING DEPOSIT:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create deposit request',
      details: error.message 
    });
  }
});

// Get user deposits
app.get('/api/deposits', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const deposits = await Deposit.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      deposits
    });

  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch deposits',
      details: error.message 
    });
  }
});

// Admin: Confirm deposit (for admin use)
app.put('/api/deposits/:id/confirm', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    console.log(`🔧 ADMIN DEPOSIT APPROVAL: Admin ${req.user.username} approving deposit ${id}`);
    console.log(`   Admin Notes: ${notes}`);

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      console.log(`❌ DEPOSIT NOT FOUND: Deposit ID ${id} not found`);
      return res.status(404).json({ 
        success: false, 
        error: 'Deposit not found' 
      });
    }

    console.log(`📋 DEPOSIT DETAILS: Found deposit for user ${deposit.userId}`);
    console.log(`   Amount: $${deposit.amount}`);
    console.log(`   Current Status: ${deposit.status}`);
    console.log(`   Created At: ${deposit.createdAt}`);

    // Update user balance and check for task unlocking
    const user = await User.findById(deposit.userId);
    if (user) {
      console.log(`👤 USER FOUND: ${user.username} (${user._id})`);
      console.log(`   Current Balance: $${user.balance}`);
      console.log(`   Current hasDeposited: ${user.hasDeposited}`);

      // Update deposit status
      deposit.status = 'confirmed';
      deposit.confirmedAt = new Date();
      if (notes) deposit.notes = notes;

      // Save the deposit
      await deposit.save();
      console.log(`✅ DEPOSIT CONFIRMED: Deposit ${id} status updated to 'confirmed'`);
      
      // Check if this is the first deposit of at least $10
      const existingConfirmedDeposits = await Deposit.find({ 
        userId: deposit.userId, 
        status: 'confirmed',
        _id: { $ne: deposit._id } // Exclude current deposit
      });
      
      const isFirstDeposit = existingConfirmedDeposits.length === 0;
      const isMinimumAmount = deposit.amount >= 10;
      
      console.log(`🔍 DEPOSIT ANALYSIS: User ${user.username}`);
      console.log(`   This Deposit: $${deposit.amount}`);
      console.log(`   Is First Deposit: ${isFirstDeposit}`);
      console.log(`   Is Minimum Amount ($10+): ${isMinimumAmount}`);
      console.log(`   Previous Balance: $${user.balance}`);
      console.log(`   Previous hasDeposited: ${user.hasDeposited}`);
      
      const previousHasDeposited = user.hasDeposited;
      const previousBalance = user.balance;
      
      if (isFirstDeposit && isMinimumAmount) {
        // First deposit of $10+ unlocks tasks but doesn't add to balance
        user.hasDeposited = true;
        // Balance calculation: total deposits - 10
        const totalConfirmedDeposits = await Deposit.aggregate([
          { $match: { userId: deposit.userId, status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
        user.balance = Math.max(0, totalDeposits - 10);
        console.log(`✅ FIRST DEPOSIT: Tasks unlocked! Balance = ${totalDeposits} - 10 = $${user.balance}`);
      } else if (!isFirstDeposit) {
        // Subsequent deposits add to balance normally
        const totalConfirmedDeposits = await Deposit.aggregate([
          { $match: { userId: deposit.userId, status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
        user.balance = Math.max(0, totalDeposits - 10);
        user.hasDeposited = true; // Ensure tasks remain unlocked
        console.log(`✅ SUBSEQUENT DEPOSIT: Balance = ${totalDeposits} - 10 = $${user.balance}`);
      } else {
        // First deposit but less than $10 - doesn't unlock tasks
        console.log(`⚠️ FIRST DEPOSIT TOO SMALL: $${deposit.amount} < $10, tasks remain locked`);
        user.balance += deposit.amount; // Add to balance normally
      }
      
      await user.save();
      
      console.log(`✅ USER UPDATED: ${user.username}`);
      console.log(`   Balance: $${previousBalance} → $${user.balance}`);
      console.log(`   hasDeposited: ${previousHasDeposited} → ${user.hasDeposited}`);
      console.log(`   Tasks Status: ${user.hasDeposited ? '🔓 UNLOCKED' : '🔒 LOCKED'}`);
      
      // Update the session user object if the user is logged in
      if (req.session && req.session.passport && req.session.passport.user === user._id.toString()) {
        req.user = user;
        console.log('✅ SESSION UPDATED: User session object updated');
      } else {
        console.log('⚠️ SESSION UPDATE FAILED: Could not update session');
        console.log('   Session Info:', {
          hasSession: !!req.session,
          hasPassport: !!(req.session && req.session.passport),
          sessionUserId: req.session?.passport?.user,
          actualUserId: user._id.toString(),
          isUserEndpoint: true
        });
      }
      
      // Check if this deposit completes any pending referrals
      await checkAndCompleteReferrals(user._id);
      console.log(`✅ REFERRAL CHECK: Completed referral check for user ${user.username}`);
    } else {
      console.log(`❌ USER NOT FOUND: User ID ${deposit.userId} not found`);
    }

    console.log(`🎉 DEPOSIT APPROVAL COMPLETE: Deposit ${id} successfully confirmed`);
    res.json({
      success: true,
      message: 'Deposit confirmed successfully',
      deposit
    });

  } catch (error) {
    console.error('❌ ERROR CONFIRMING DEPOSIT:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to confirm deposit',
      details: error.message 
    });
  }
});

// Admin: Reject deposit (for admin use)
app.put('/api/deposits/:id/reject', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ 
        success: false, 
        error: 'Deposit not found' 
      });
    }

    // Update deposit status
    deposit.status = 'rejected';
    deposit.confirmedAt = new Date();
    if (notes) deposit.notes = notes;

    await deposit.save();

    res.json({
      success: true,
      message: 'Deposit rejected successfully',
      deposit
    });

  } catch (error) {
    console.error('Error rejecting deposit:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject deposit',
      details: error.message 
    });
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

// Admin: Get all deposits with pagination
app.get('/api/admin/deposits', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination info
    const total = await Deposit.countDocuments({});
    
    // Get paginated deposits with user info
    const deposits = await Deposit.find({})
      .populate('userId', 'email username')
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limit);
    
    // Transform the data to match frontend expectations
    const transformedDeposits = deposits.map(deposit => {
      const depositObj = deposit.toObject();
      return {
        ...depositObj,
        user: depositObj.userId, // Map userId to user for frontend compatibility
        userId: depositObj.userId?._id || depositObj.userId // Keep original userId as well
      };
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({ 
      deposits: transformedDeposits,
      pagination: {
        currentPage: page,
        totalPages,
        totalDeposits: total,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deposits', details: err.message });
  }
});

// Admin: Confirm deposit (no authentication required for admin panel)
app.put('/api/admin/deposits/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    console.log(`🔧 ADMIN PANEL DEPOSIT APPROVAL: Admin panel approving deposit ${id}`);
    console.log(`   Admin Notes: ${notes}`);

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      console.log(`❌ DEPOSIT NOT FOUND: Deposit ID ${id} not found`);
      return res.status(404).json({ 
        success: false, 
        error: 'Deposit not found' 
      });
    }

    console.log(`📋 DEPOSIT DETAILS: Found deposit for user ${deposit.userId}`);
    console.log(`   Amount: $${deposit.amount}`);
    console.log(`   Current Status: ${deposit.status}`);
    console.log(`   Created At: ${deposit.createdAt}`);

    // Update user balance and check for task unlocking
    const user = await User.findById(deposit.userId);
    if (user) {
      console.log(`👤 USER FOUND: ${user.username} (${user._id})`);
      console.log(`   Current Balance: $${user.balance}`);
      console.log(`   Current hasDeposited: ${user.hasDeposited}`);

      // Update deposit status
      deposit.status = 'confirmed';
      deposit.confirmedAt = new Date();
      if (notes) deposit.notes = notes;

      // Save the deposit
      await deposit.save();
      console.log(`✅ DEPOSIT CONFIRMED: Deposit ${id} status updated to 'confirmed'`);
      
      // Check if this is the first deposit of at least $10
      const existingConfirmedDeposits = await Deposit.find({ 
        userId: deposit.userId, 
        status: 'confirmed',
        _id: { $ne: deposit._id } // Exclude current deposit
      });
      
      const isFirstDeposit = existingConfirmedDeposits.length === 0;
      const isMinimumAmount = deposit.amount >= 10;
      
      console.log(`🔍 ADMIN DEPOSIT ANALYSIS: User ${user.username}`);
      console.log(`   This Deposit: $${deposit.amount}`);
      console.log(`   Is First Deposit: ${isFirstDeposit}`);
      console.log(`   Is Minimum Amount ($10+): ${isMinimumAmount}`);
      console.log(`   Previous Balance: $${user.balance}`);
      console.log(`   Previous hasDeposited: ${user.hasDeposited}`);
      
      const previousHasDeposited = user.hasDeposited;
      const previousBalance = user.balance;
      
      if (isFirstDeposit && isMinimumAmount) {
        // First deposit of $10+ unlocks tasks but doesn't add to balance
        user.hasDeposited = true;
        // Balance calculation: total deposits - 10
        const totalConfirmedDeposits = await Deposit.aggregate([
          { $match: { userId: deposit.userId, status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
        user.balance = Math.max(0, totalDeposits - 10);
        console.log(`✅ ADMIN FIRST DEPOSIT: Tasks unlocked! Balance = ${totalDeposits} - 10 = $${user.balance}`);
      } else if (!isFirstDeposit) {
        // Subsequent deposits add to balance normally
        const totalConfirmedDeposits = await Deposit.aggregate([
          { $match: { userId: deposit.userId, status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
        user.balance = Math.max(0, totalDeposits - 10);
        user.hasDeposited = true; // Ensure tasks remain unlocked
        console.log(`✅ ADMIN SUBSEQUENT DEPOSIT: Balance = ${totalDeposits} - 10 = $${user.balance}`);
      } else {
        // First deposit but less than $10 - doesn't unlock tasks
        console.log(`⚠️ ADMIN FIRST DEPOSIT TOO SMALL: $${deposit.amount} < $10, tasks remain locked`);
        user.balance += deposit.amount; // Add to balance normally
      }
      
      await user.save();
      
      console.log(`✅ ADMIN USER UPDATED: ${user.username}`);
      console.log(`   Balance: $${previousBalance} → $${user.balance}`);
      console.log(`   hasDeposited: ${previousHasDeposited} → ${user.hasDeposited}`);
      console.log(`   Tasks Status: ${user.hasDeposited ? '🔓 UNLOCKED' : '🔒 LOCKED'}`);
      
      // Update the session user object if the user is logged in
      if (req.session && req.session.passport && req.session.passport.user === user._id.toString()) {
        req.user = user;
        console.log('✅ ADMIN SESSION UPDATED: User session object updated');
      } else {
        console.log('⚠️ ADMIN SESSION UPDATE FAILED: Could not update session');
        console.log('   Session Info:', {
          hasSession: !!req.session,
          hasPassport: !!(req.session && req.session.passport),
          sessionUserId: req.session?.passport?.user,
          actualUserId: user._id.toString(),
          isAdminEndpoint: true
        });
      }
      
      // Check if this deposit completes any pending referrals
      await checkAndCompleteReferrals(user._id);
      console.log(`✅ ADMIN REFERRAL CHECK: Completed referral check for user ${user.username}`);
    } else {
      console.log(`❌ ADMIN USER NOT FOUND: User ID ${deposit.userId} not found`);
    }

    console.log(`🎉 ADMIN DEPOSIT APPROVAL COMPLETE: Deposit ${id} successfully confirmed`);
    res.json({
      success: true,
      message: 'Deposit confirmed successfully',
      deposit
    });

  } catch (error) {
    console.error('❌ ADMIN ERROR CONFIRMING DEPOSIT:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to confirm deposit',
      details: error.message 
    });
  }
});

// Admin: Reject deposit (no authentication required for admin panel)
app.put('/api/admin/deposits/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ 
        success: false, 
        error: 'Deposit not found' 
      });
    }

    // Update deposit status
    deposit.status = 'rejected';
    deposit.confirmedAt = new Date();
    if (notes) deposit.notes = notes;

    await deposit.save();

    res.json({
      success: true,
      message: 'Deposit rejected successfully',
      deposit
    });

  } catch (error) {
    console.error('Error rejecting deposit:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject deposit',
      details: error.message 
    });
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
  type: { type: String, enum: ['general', 'promotion', 'system', 'warning'], default: 'general' },
  recipientType: { type: String, enum: ['all_users', 'active_users', 'new_users', 'custom'], required: true },
  recipientId: String, // For custom user notifications
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true },
  category: { type: String, required: true, enum: ['Social Media', 'App Store', 'Survey', 'Other'] },
  timeEstimate: { type: String, required: true },
  requirements: [{ type: String }],
  url: { type: String, default: "" },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// Task Submission Schema
const taskSubmissionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  screenshotUrl: { type: String },
  notes: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String }
});

const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

// Admin: Create notification
app.post('/api/admin/notifications', async (req, res) => {
  try {
    const { title, message, type, recipientType, recipientId } = req.body;
    
    // Validate required fields
    if (!title || !message || !recipientType) {
      return res.status(400).json({ error: 'Title, message, and recipient type are required' });
    }

    // Create notification
    const notification = new Notification({ 
      title, 
      message, 
      type: type || 'general',
      recipientType,
      recipientId: recipientType === 'custom' ? recipientId : undefined
    });
    await notification.save();

    // Send notification to users based on recipient type
    let usersToNotify = [];
    
    switch (recipientType) {
      case 'all_users':
        usersToNotify = await User.find({});
        break;
      case 'active_users':
        // Users who have logged in within the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        usersToNotify = await User.find({ lastLogin: { $gte: thirtyDaysAgo } });
        break;
      case 'new_users':
        // Users who registered within the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        usersToNotify = await User.find({ createdAt: { $gte: sevenDaysAgo } });
        break;
      case 'custom':
        if (recipientId) {
          const user = await User.findById(recipientId);
          if (user) {
            usersToNotify = [user];
          }
        }
        break;
    }

    // Here you would typically send the notification to each user
    // For now, we'll just log it
    console.log(`Notification "${title}" sent to ${usersToNotify.length} users`);

    res.status(201).json({ 
      success: true, 
      notification,
      recipientsCount: usersToNotify.length
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification', details: err.message });
  }
});

// Admin: Get all notifications
app.get('/api/admin/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// Admin: Get dashboard statistics
app.get('/api/admin/dashboard-stats', async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Total users
    const totalUsers = await User.countDocuments({});
    const verifiedUsers = await User.countDocuments({ verified: true });
    const unverifiedUsers = totalUsers - verifiedUsers;
    
    // New users (today, this month, last month)
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonth } });
    const newUsersLastMonth = await User.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: thisMonth } 
    });
    
    // Total balance across all users
    const usersWithBalance = await User.find({}, 'balance');
    const totalBalance = usersWithBalance.reduce((sum, user) => sum + (user.balance || 0), 0);
    
    // Deposits statistics
    const totalDeposits = await Deposit.countDocuments({});
    const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });
    const confirmedDeposits = await Deposit.countDocuments({ status: 'confirmed' });
    const totalDepositAmount = await Deposit.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDepositValue = totalDepositAmount.length > 0 ? totalDepositAmount[0].total : 0;
    
    // Participation statistics
    const totalParticipations = await Participation.countDocuments({});
    const pendingParticipations = await Participation.countDocuments({ submittedButton: null });
    const approvedParticipations = await Participation.countDocuments({ submittedButton: true });
    const rejectedParticipations = await Participation.countDocuments({ submittedButton: false });
    
    // Referral statistics
    const totalReferrals = await Referral.countDocuments({});
    const completedReferrals = await Referral.aggregate([
      { $lookup: { 
        from: 'users', 
        localField: 'referred', 
        foreignField: '_id', 
        as: 'referredUser' 
      }},
      { $match: { 
        'referredUser.hasDeposited': true 
      }},
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);
    const pendingReferrals = await Referral.countDocuments({ status: 'pending' });
    
    // Withdrawal statistics
    const totalWithdrawals = await WithdrawalRequest.countDocuments({});
    const pendingWithdrawals = await WithdrawalRequest.countDocuments({ status: 'pending' });
    const completedWithdrawals = await WithdrawalRequest.countDocuments({ status: 'completed' });
    const totalWithdrawalAmount = await WithdrawalRequest.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawalValue = totalWithdrawalAmount.length > 0 ? totalWithdrawalAmount[0].total : 0;
    
    // Recent activity (last 7 days)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: lastWeek } });
    const recentDeposits = await Deposit.countDocuments({ createdAt: { $gte: lastWeek } });
    const recentParticipations = await Participation.countDocuments({ createdAt: { $gte: lastWeek } });
    const recentWithdrawals = await WithdrawalRequest.countDocuments({ createdAt: { $gte: lastWeek } });
    
    // Monthly growth
    const monthlyGrowth = lastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100) : 0;
    
    const stats = {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth,
        newLastMonth: newUsersLastMonth,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      },
      deposits: {
        total: totalDeposits,
        pending: pendingDeposits,
        confirmed: confirmedDeposits,
        totalAmount: totalDepositValue
      },
      participations: {
        total: totalParticipations,
        pending: pendingParticipations,
        approved: approvedParticipations,
        rejected: rejectedParticipations
      },
      referrals: {
        total: totalReferrals,
        completed: completedReferrals,
        pending: pendingReferrals
      },
      withdrawals: {
        total: totalWithdrawals,
        pending: pendingWithdrawals,
        completed: completedWithdrawals,
        totalAmount: totalWithdrawalValue
      },
      balance: {
        total: totalBalance
      },
      recentActivity: {
        users: recentUsers,
        deposits: recentDeposits,
        participations: recentParticipations,
        withdrawals: recentWithdrawals
      }
    };
    
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics', details: err.message });
  }
});

// Get all notifications (for admin)
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// Get user notifications (for frontend users)
app.get('/api/user/notifications', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get notifications that apply to this user
    const notifications = await Notification.find({
      $or: [
        { recipientType: 'all_users' },
        { recipientType: 'active_users' },
        { recipientType: 'new_users' },
        { recipientType: 'custom', recipientId: userId }
      ]
    }).sort({ createdAt: -1 }).limit(20);
    
    res.json({ success: true, notifications });
  } catch (err) {
    console.error('Error fetching user notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// Mark notification as read
app.put('/api/user/notifications/:id/read', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // For now, we'll just return success since we don't have a read status in the schema
    // In a real implementation, you'd want to add a readBy field to track which users have read each notification
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read', details: err.message });
  }
});

// Mark all notifications as read
app.put('/api/user/notifications/read-all', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // For now, we'll just return success since we don't have a read status in the schema
    // In a real implementation, you'd want to add a readBy field to track which users have read each notification
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read', details: err.message });
  }
});

// Referral System Endpoints

// Get user's referral information
app.get('/api/referrals/my-info', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get referral link - use user ID for referral links
    const referralLink = `${req.protocol}://${req.get('host')}/signup?ref=${user._id}`;

    // Get recent referrals - show ALL referrals (including pending ones)
    const recentReferrals = await Referral.find({ referrer: user._id })
      .populate({
        path: 'referred',
        select: 'username email createdAt hasDeposited'
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get total referrals count (only confirmed referrals where referred user has deposited)
    const totalReferrals = await Referral.aggregate([
      { $match: { referrer: user._id } },
      { $lookup: { 
        from: 'users', 
        localField: 'referred', 
        foreignField: '_id', 
        as: 'referredUser' 
      }},
      { $match: { 
        'referredUser.hasDeposited': true 
      }},
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    res.json({
      referralCode: user.referralCode,
      referralLink,
      recentReferrals,
      totalReferrals
    });
  } catch (err) {
    console.error('Error fetching referral info:', err);
    res.status(500).json({ error: 'Failed to fetch referral information' });
  }
});

// Get user dashboard statistics
app.get('/api/user/dashboard-stats', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's completed tasks count
    const completedTasks = await TaskSubmission.countDocuments({ 
      userId: userId, 
      status: 'approved' 
    });

    // Get user's pending tasks count
    const pendingTasks = await TaskSubmission.countDocuments({ 
      userId: userId, 
      status: 'pending' 
    });

    // Get user's total deposits
    const totalDeposits = await Deposit.countDocuments({ 
      userId: userId, 
      status: 'confirmed' 
    });

    // Get user's total deposit amount
    const totalDepositAmount = await Deposit.aggregate([
      { $match: { userId: userId, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(result => result[0]?.total || 0);

    // Get user's lucky draw participations
    const luckyDrawParticipations = await Participation.countDocuments({ 
      userId: userId 
    });

    // Get user's total referrals (confirmed)
    const totalReferrals = await Referral.aggregate([
      { $match: { referrer: userId } },
      { $lookup: { 
        from: 'users', 
        localField: 'referred', 
        foreignField: '_id', 
        as: 'referredUser' 
      }},
      { $match: { 
        'referredUser.hasDeposited': true 
      }},
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    // Get user's pending referrals
    const pendingReferrals = await Referral.countDocuments({ 
      referrer: userId, 
      status: 'pending' 
    });

    res.json({
      success: true,
      stats: {
        completedTasks,
        pendingTasks,
        totalDeposits,
        totalDepositAmount,
        luckyDrawParticipations,
        totalReferrals,
        pendingReferrals
      }
    });
  } catch (err) {
    console.error('Error fetching user dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch user dashboard statistics' });
  }
});

// Get user's referral statistics
app.get('/api/referrals/stats', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total referrals (count only confirmed referrals where referred user has deposited)
    const totalReferrals = await Referral.aggregate([
      { $match: { referrer: userId } },
      { $lookup: { 
        from: 'users', 
        localField: 'referred', 
        foreignField: '_id', 
        as: 'referredUser' 
      }},
      { $match: { 
        'referredUser.hasDeposited': true 
      }},
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    // Get pending referrals (count all pending referrals)
    const pendingReferrals = await Referral.countDocuments({ 
      referrer: userId, 
      status: 'pending' 
    });

    // Get completed referrals (count all completed referrals)
    const completedReferrals = await Referral.countDocuments({ 
      referrer: userId, 
      status: 'completed' 
    });

    // Get this month's confirmed referrals where the referred user has deposited
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthReferrals = await Referral.aggregate([
      { $match: { 
        referrer: userId,
        createdAt: { $gte: startOfMonth }
      }},
      { $lookup: { 
        from: 'users', 
        localField: 'referred', 
        foreignField: '_id', 
        as: 'referredUser' 
      }},
      { $match: { 
        'referredUser.hasDeposited': true 
      }},
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    res.json({
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      thisMonthReferrals
    });
  } catch (err) {
    console.error('Error fetching referral stats:', err);
    res.status(500).json({ error: 'Failed to fetch referral statistics' });
  }
});

// Get all referrals for a user (with pagination) - only deposited users
app.get('/api/referrals/all', ensureAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const referrals = await Referral.find({ referrer: req.user._id })
      .populate({
        path: 'referred',
        select: 'username email createdAt verified hasDeposited',
        match: { hasDeposited: true } // Only include users who have deposited
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .then(referrals => referrals.filter(ref => ref.referred)); // Filter out null referred users

    // Count total referrals that have deposited
    const total = await Referral.aggregate([
      { $match: { referrer: req.user._id } },
      { $lookup: { from: 'users', localField: 'referred', foreignField: '_id', as: 'referredUser' } },
      { $match: { 'referredUser.hasDeposited': true } },
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    res.json({
      referrals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReferrals: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching all referrals:', err);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get all referrals for a user (with pagination) - including pending ones
app.get('/api/referrals/all-with-pending', ensureAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const referrals = await Referral.find({ referrer: req.user._id })
      .populate({
        path: 'referred',
        select: 'username email createdAt verified hasDeposited'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .then(referrals => referrals.filter(ref => ref.referred)); // Filter out null referred users

    const total = await Referral.countDocuments({ referrer: req.user._id });

    res.json({
      referrals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReferrals: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching all referrals including pending:', err);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Validate referral code (supports both user ID and referral code)
app.get('/api/referrals/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    let user = null;
    
    // First try to find by user ID (for new referral system)
    if (code.length === 24) { // MongoDB ObjectId length
      user = await User.findById(code);
    }
    
    // If not found by ID, try by referral code (for backward compatibility)
    if (!user) {
      user = await User.findOne({ referralCode: code });
    }
    
    if (user) {
      res.json({ 
        valid: true, 
        referrerName: user.username,
        referrerId: user._id
      });
    } else {
      res.json({ 
        valid: false 
      });
    }
  } catch (err) {
    console.error('Error validating referral code:', err);
    res.status(500).json({ error: 'Failed to validate referral code' });
  }
});

// Get user balance
app.get('/api/user/balance', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      balance: user.balance || 0 
    });
  } catch (err) {
    console.error('Error fetching user balance:', err);
    res.status(500).json({ error: 'Failed to fetch user balance' });
  }
});

// API endpoint for email verification (for frontend calls)
app.post('/api/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    // Check if user is already verified
    if (user.verified) {
      return res.json({ 
        success: true, 
        message: 'Email already verified! You can now log in.' 
      });
    }
    
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    
    // Handle referral completion if user was referred
    if (user.referredBy) {
      const referral = await Referral.findOne({ 
        referrer: user.referredBy, 
        referred: user._id,
        status: 'pending'
      });
      
      if (referral) {
        // Update referral status to completed (no bonus given)
        referral.status = 'completed';
        await referral.save();
        
        console.log(`Referral completed: ${user.referredBy} referred ${user.username} (no bonus given)`);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully! You can now log in.' 
    });
  } catch (err) {
    console.error('Error verifying email:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// Resend verification email
app.post('/api/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();
    
    // Send verification email
    const verifyUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verificationToken}`;
    
    if (DISABLE_EMAILS) {
      console.log('📧 EMAIL DISABLED: Would resend verification email to:', user.email);
      console.log('📧 Verification URL:', verifyUrl);
    } else {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Verify your email for EasyEarn',
        html: `<h2>Welcome, ${user.username}!</h2><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });
  } catch (err) {
    console.error('Error resending verification email:', err);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Admin: Manually verify a user (for testing purposes - remove in production)
app.post('/api/admin/verify-user', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.verified) {
      return res.json({ 
        success: true, 
        message: 'User is already verified',
        user: {
          email: user.email,
          verified: user.verified,
          balance: user.balance
        }
      });
    }
    
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    
    // Handle referral bonus if user was referred
    if (user.referredBy) {
      const referral = await Referral.findOne({ 
        referrer: user.referredBy, 
        referred: user._id,
        status: 'pending'
      });
      
      if (referral) {
        // Update referral status to completed (no bonus given)
        referral.status = 'completed';
        await referral.save();
        
        console.log(`Referral completed: ${user.referredBy} referred ${user.username} (no bonus given)`);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'User verified successfully',
      user: {
        email: user.email,
        verified: user.verified,
        balance: user.balance,
        referredBy: user.referredBy
      }
    });
  } catch (err) {
    console.error('Error manually verifying user:', err);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// Admin: Get all referrals
app.get('/api/admin/referrals', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const referrals = await Referral.find({})
      .populate('referrer', 'username email')
      .populate('referred', 'username email createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Referral.countDocuments({});

    res.json({
      referrals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReferrals: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching admin referrals:', err);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Admin: Generate referral codes for existing users (one-time migration)
app.post('/api/admin/generate-referral-codes', async (req, res) => {
  try {
    const usersWithoutCodes = await User.find({ referralCode: { $exists: false } });
    let updatedCount = 0;

    for (const user of usersWithoutCodes) {
      user.referralCode = generateReferralCode();
      await user.save();
      updatedCount++;
    }

    res.json({ 
      success: true, 
      message: `Generated referral codes for ${updatedCount} users`,
      updatedCount 
    });
  } catch (err) {
    console.error('Error generating referral codes:', err);
    res.status(500).json({ error: 'Failed to generate referral codes' });
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

// Screenshot upload endpoint for task submissions
app.post('/api/upload-screenshot', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the file URL with proper protocol
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Image upload endpoint for deposit receipts
app.post('/api/upload-image', ensureAuthenticated, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  
  // Validate file type
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  
  // Validate file size (max 5MB)
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image size must be less than 5MB' });
  }
  
  // Return the file URL
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Get or create withdrawal requirements for current period
app.get('/api/withdrawal-requirements', ensureAuthenticated, async (req, res) => {
  try {
    console.log('Withdrawal requirements endpoint hit for user:', req.user._id);
    
    const userId = req.user._id;
    const now = new Date();
    
    // Calculate current 15-day period
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - (periodStart.getDate() % 15));
    periodStart.setHours(0, 0, 0, 0);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 15);
    periodEnd.setHours(23, 59, 59, 999);

    console.log('Period calculation:', { periodStart, periodEnd, now });

    // Find or create requirement record
    let requirement = await WithdrawalRequirement.findOne({
      userId,
      periodStart: { $lte: now },
      periodEnd: { $gte: now }
    });

    console.log('Existing requirement found:', !!requirement);

    if (!requirement) {
      console.log('Creating new requirement record');
      // Create new period requirement
      requirement = new WithdrawalRequirement({
        userId,
        periodStart,
        periodEnd,
        requirements: {
          referrals: { required: 1, completed: 0, met: false }, // Changed from 2 to 1
          deposit: { required: 10, completed: 0, met: false }, // Amount in dollars
          luckyDraw: { required: 1, completed: 0, met: false }
        }
      });
      await requirement.save();
      console.log('New requirement saved');
    }

    // Update requirements based on user activity
    const user = await User.findById(userId);
    console.log('User found:', !!user);
    
    // Check confirmed referrals where the referred user has deposited in this period
    const referralsInPeriod = await Referral.aggregate([
      { $match: { 
        referrer: userId,
        createdAt: { $gte: periodStart, $lte: periodEnd }
      }},
      { $lookup: { 
        from: 'users', 
        localField: 'referred', 
        foreignField: '_id', 
        as: 'referredUser' 
      }},
      { $match: { 
        'referredUser.hasDeposited': true 
      }},
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);
    console.log('Referrals in period:', referralsInPeriod);

    // Check total deposit amount (not count)
    const totalDeposits = await Deposit.aggregate([
      { $match: { userId: userId, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
    console.log('Total deposit amount:', totalDepositAmount);

    // Check lucky draw participations in current 15-day period
    const luckyDrawInPeriod = await Participation.countDocuments({
      userId,
      createdAt: { $gte: periodStart, $lte: periodEnd }
    });
    console.log('Lucky draw participations in period:', luckyDrawInPeriod);

    // Update requirement status
    requirement.requirements.referrals.completed = referralsInPeriod;
    requirement.requirements.referrals.met = referralsInPeriod >= 1; // Changed from 2 to 1
    
    requirement.requirements.deposit.completed = totalDepositAmount;
    requirement.requirements.deposit.met = totalDepositAmount >= 10;
    
    requirement.requirements.luckyDraw.completed = luckyDrawInPeriod;
    requirement.requirements.luckyDraw.met = luckyDrawInPeriod >= 1;

    requirement.allRequirementsMet = 
      requirement.requirements.referrals.met &&
      requirement.requirements.deposit.met &&
      requirement.requirements.luckyDraw.met;

    console.log('Requirements status:', {
      referrals: requirement.requirements.referrals,
      deposit: requirement.requirements.deposit,
      luckyDraw: requirement.requirements.luckyDraw,
      allMet: requirement.allRequirementsMet
    });

    // Check if period ended and requirements not met
    if (now > periodEnd && !requirement.allRequirementsMet && !requirement.balanceReset) {
      console.log('Period ended, resetting balance');
      // Reset user balance to zero
      user.balance = 0;
      await user.save();
      requirement.balanceReset = true;
    }

    requirement.updatedAt = now;
    await requirement.save();

    const response = {
      success: true,
      requirement: {
        periodStart: requirement.periodStart,
        periodEnd: requirement.periodEnd,
        requirements: requirement.requirements,
        allRequirementsMet: requirement.allRequirementsMet,
        balanceReset: requirement.balanceReset,
        daysLeft: Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))
      }
    };

    console.log('Sending response:', response);
    res.json(response);

  } catch (error) {
    console.error('Error getting withdrawal requirements:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get withdrawal requirements',
      details: error.message 
    });
  }
});

// Submit withdrawal request
app.post('/api/withdrawal-request', ensureAuthenticated, async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (!amount || amount < 20) {
      return res.status(400).json({ success: false, error: 'Minimum withdrawal amount is $20' });
    }

    // Check user balance
    const user = await User.findById(userId);
    if (!user || user.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    // Check withdrawal requirements
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - (periodStart.getDate() % 15));
    periodStart.setHours(0, 0, 0, 0);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 15);
    periodEnd.setHours(23, 59, 59, 999);

    const requirement = await WithdrawalRequirement.findOne({
      userId,
      periodStart: { $lte: now },
      periodEnd: { $gte: now }
    });

    if (!requirement || !requirement.allRequirementsMet) {
      return res.status(400).json({ success: false, error: 'You must meet all withdrawal requirements first' });
    }

    // Create withdrawal request
    const withdrawalRequest = new WithdrawalRequest({
      userId,
      amount,
      walletAddress,
      status: 'pending'
    });

    await withdrawalRequest.save();

    // Deduct amount from user balance
    user.balance -= amount;
    await user.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawalRequest: {
        id: withdrawalRequest._id,
        amount: withdrawalRequest.amount,
        status: withdrawalRequest.status,
        createdAt: withdrawalRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting withdrawal request:', error);
    res.status(500).json({ success: false, error: 'Failed to submit withdrawal request' });
  }
});

// Get user's withdrawal history
app.get('/api/withdrawal-history', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const withdrawals = await WithdrawalRequest.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w._id,
        amount: w.amount,
        walletAddress: w.walletAddress,
        status: w.status,
        createdAt: w.createdAt,
        processedAt: w.processedAt,
        notes: w.notes
      }))
    });

  } catch (error) {
    console.error('Error getting withdrawal history:', error);
    res.status(500).json({ success: false, error: 'Failed to get withdrawal history' });
  }
});

// ==================== TASK MANAGEMENT API ENDPOINTS ====================

// Get all active tasks (for frontend users)
app.get('/api/tasks', ensureAuthenticated, async (req, res) => {
  try {
    console.log('Tasks API called by user:', req.user._id)
    
    // First, let's see all tasks for debugging
    const allTasks = await Task.find({}).sort({ createdAt: -1 });
    console.log('All tasks in database:', allTasks.length)
    console.log('Task statuses:', allTasks.map(t => ({ id: t._id, title: t.title, status: t.status })))
    
    const tasks = await Task.find({ status: 'active' }).sort({ createdAt: -1 });
    console.log('Active tasks found:', tasks.length)
    
    // Get user's submissions for these tasks
    const userSubmissions = await TaskSubmission.find({ 
      userId: req.user._id 
    }).populate('taskId');
    
    // Create a map of task submissions
    const submissionMap = {};
    userSubmissions.forEach(submission => {
      submissionMap[submission.taskId._id.toString()] = submission.status;
    });
    
    // Add submission status to each task
    const tasksWithStatus = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      reward: task.reward,
      category: task.category,
      timeEstimate: task.timeEstimate,
      requirements: task.requirements,
      url: task.url,
      status: submissionMap[task._id.toString()] || 'available',
      createdAt: task.createdAt
    }));

    res.json({
      success: true,
      tasks: tasksWithStatus
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// Submit task completion (for frontend users)
app.post('/api/tasks/:taskId/submit', ensureAuthenticated, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { screenshotUrl, notes } = req.body;
    const userId = req.user._id;

    // Check if task exists and is active
    const task = await Task.findById(taskId);
    if (!task || task.status !== 'active') {
      return res.status(404).json({ success: false, error: 'Task not found or inactive' });
    }

    // Check if user already submitted this task
    const existingSubmission = await TaskSubmission.findOne({ taskId, userId });
    
    if (existingSubmission) {
      // If submission exists and is not rejected, don't allow resubmission
      if (existingSubmission.status !== 'rejected') {
        return res.status(400).json({ success: false, error: 'Task already submitted' });
      }
      
      // If submission was rejected, update it with new data
      existingSubmission.screenshotUrl = screenshotUrl;
      existingSubmission.notes = notes;
      existingSubmission.status = 'pending';
      existingSubmission.submittedAt = new Date();
      existingSubmission.reviewedAt = null;
      existingSubmission.reviewNotes = null;
      
      await existingSubmission.save();
      
      res.json({
        success: true,
        message: 'Task resubmitted successfully for review',
        submission: {
          id: existingSubmission._id,
          status: existingSubmission.status,
          submittedAt: existingSubmission.submittedAt
        }
      });
      return;
    }

    // Create new task submission
    const submission = new TaskSubmission({
      taskId,
      userId,
      screenshotUrl,
      notes,
      status: 'pending'
    });

    await submission.save();

    res.json({
      success: true,
      message: 'Task submitted successfully for review',
      submission: {
        id: submission._id,
        status: submission.status,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({ success: false, error: 'Failed to submit task' });
  }
});

// ==================== ADMIN TASK MANAGEMENT ENDPOINTS ====================

// Get all tasks (for admin)
app.get('/api/admin/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      tasks: tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        reward: task.reward,
        category: task.category,
        timeEstimate: task.timeEstimate,
        requirements: task.requirements,
        url: task.url,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching admin tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// Create new task (for admin)
app.post('/api/admin/tasks', async (req, res) => {
  try {
    const { title, description, reward, category, timeEstimate, requirements, url } = req.body;
    
    // Validate required fields
    if (!title || !description || !reward || !category || !timeEstimate) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const task = new Task({
      title,
      description,
      reward: Number(reward),
      category,
      timeEstimate,
      requirements: requirements || [],
      url: url || ""
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
              task: {
          id: task._id,
          title: task.title,
          description: task.description,
          reward: task.reward,
          category: task.category,
          timeEstimate: task.timeEstimate,
          requirements: task.requirements,
          url: task.url,
          status: task.status,
          createdAt: task.createdAt
        }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// Update task (for admin)
app.put('/api/admin/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, reward, category, timeEstimate, requirements, status, url } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (reward) task.reward = Number(reward);
    if (category) task.category = category;
    if (timeEstimate) task.timeEstimate = timeEstimate;
    if (requirements) task.requirements = requirements;
    if (status) task.status = status;
    if (url !== undefined) task.url = url;
    
    task.updatedAt = new Date();
    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        reward: task.reward,
        category: task.category,
        timeEstimate: task.timeEstimate,
        requirements: task.requirements,
        url: task.url,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// Delete task (for admin)
app.delete('/api/admin/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Delete task and all related submissions
    await Task.findByIdAndDelete(taskId);
    await TaskSubmission.deleteMany({ taskId });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

// Get task submissions (for admin)
app.get('/api/admin/task-submissions', async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({})
      .populate('taskId')
      .populate('userId', 'username email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      submissions: submissions.map(submission => ({
        id: submission._id,
        task: submission.taskId ? {
          id: submission.taskId._id,
          title: submission.taskId.title,
          reward: submission.taskId.reward
        } : null,
        user: submission.userId ? {
          id: submission.userId._id,
          username: submission.userId.username,
          email: submission.userId.email
        } : null,
        status: submission.status,
        screenshotUrl: submission.screenshotUrl,
        notes: submission.notes,
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt,
        reviewNotes: submission.reviewNotes
      }))
    });
  } catch (error) {
    console.error('Error fetching task submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task submissions' });
  }
});

// Review task submission (for admin)
app.put('/api/admin/task-submissions/:submissionId/review', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const submission = await TaskSubmission.findById(submissionId)
      .populate('taskId')
      .populate('userId');

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // Update submission
    submission.status = status;
    submission.reviewedAt = new Date();
    submission.reviewNotes = reviewNotes;

    // If approved, add reward to user's balance
    if (status === 'approved' && submission.userId && submission.taskId) {
      const user = await User.findById(submission.userId._id);
      if (user) {
        user.balance += submission.taskId.reward;
        await user.save();
      }
    }

    await submission.save();

    res.json({
      success: true,
      message: `Task submission ${status}`,
      submission: {
        id: submission._id,
        status: submission.status,
        reviewedAt: submission.reviewedAt,
        reviewNotes: submission.reviewNotes
      }
    });
  } catch (error) {
    console.error('Error reviewing task submission:', error);
    res.status(500).json({ success: false, error: 'Failed to review submission' });
  }
});

// ==================== ADMIN WITHDRAWAL REQUEST ENDPOINTS ====================

// Get all withdrawal requests (for admin)
app.get('/api/admin/withdrawal-requests', async (req, res) => {
  try {
    const withdrawalRequests = await WithdrawalRequest.find({})
      .populate('userId', 'username email balance')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      withdrawalRequests: withdrawalRequests.map(request => ({
        id: request._id,
        user: {
          id: request.userId._id,
          username: request.userId.username,
          email: request.userId.email,
          balance: request.userId.balance
        },
        amount: request.amount,
        walletAddress: request.walletAddress,
        status: request.status,
        notes: request.notes,
        createdAt: request.createdAt,
        processedAt: request.processedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch withdrawal requests' });
  }
});

// Process withdrawal request (approve/reject) - for admin
app.put('/api/admin/withdrawal-requests/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    if (!['completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const withdrawalRequest = await WithdrawalRequest.findById(requestId)
      .populate('userId');

    if (!withdrawalRequest) {
      return res.status(404).json({ success: false, error: 'Withdrawal request not found' });
    }

    // Update withdrawal request
    withdrawalRequest.status = status;
    withdrawalRequest.processedAt = new Date();
    withdrawalRequest.notes = notes;

    // If rejected, refund the amount to user's balance
    if (status === 'rejected') {
      const user = await User.findById(withdrawalRequest.userId._id);
      if (user) {
        user.balance += withdrawalRequest.amount;
        await user.save();
      }
    }

    await withdrawalRequest.save();

    res.json({
      success: true,
      message: `Withdrawal request ${status}`,
      withdrawalRequest: {
        id: withdrawalRequest._id,
        status: withdrawalRequest.status,
        processedAt: withdrawalRequest.processedAt,
        notes: withdrawalRequest.notes
      }
    });
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    res.status(500).json({ success: false, error: 'Failed to process withdrawal request' });
  }
});

// ==================== ADMIN LUCKY DRAW ENDPOINTS ====================

// Get all lucky draws (for admin)
app.get('/api/admin/lucky-draws', async (req, res) => {
  try {
    const luckyDraws = await LuckyDraw.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      luckyDraws: luckyDraws
    });
  } catch (error) {
    console.error('Error fetching lucky draws:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lucky draws' });
  }
});

// Create new lucky draw (for admin)
app.post('/api/admin/lucky-draws', async (req, res) => {
  try {
    const { title, description, prize, entryFee, maxParticipants, startDate, endDate } = req.body;
    
    const now = new Date();
    const startDateTime = new Date(startDate);
    
    // Automatically set status to 'active' if start date is in the past or present
    const status = startDateTime <= now ? 'active' : 'scheduled';
    
    const luckyDraw = new LuckyDraw({
      title,
      description,
      prize,
      entryFee,
      maxParticipants,
      startDate: startDateTime,
      endDate: new Date(endDate),
      status: status
    });
    
    await luckyDraw.save();
    
    res.status(201).json({
      success: true,
      luckyDraw: luckyDraw
    });
  } catch (error) {
    console.error('Error creating lucky draw:', error);
    res.status(500).json({ success: false, error: 'Failed to create lucky draw' });
  }
});

// Delete lucky draw (for admin)
app.delete('/api/admin/lucky-draws/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const luckyDraw = await LuckyDraw.findByIdAndDelete(id);
    
    if (!luckyDraw) {
      return res.status(404).json({ success: false, error: 'Lucky draw not found' });
    }
    
    res.json({
      success: true,
      message: 'Lucky draw deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lucky draw:', error);
    res.status(500).json({ success: false, error: 'Failed to delete lucky draw' });
  }
});

// Update lucky draw (for admin)
app.put('/api/admin/lucky-draws/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, prize, entryFee, maxParticipants, startDate, endDate } = req.body;
    
    const luckyDraw = await LuckyDraw.findByIdAndUpdate(
      id,
      {
        title,
        description,
        prize,
        entryFee,
        maxParticipants,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      { new: true }
    );
    
    if (!luckyDraw) {
      return res.status(404).json({ success: false, error: 'Lucky draw not found' });
    }
    
    res.json({
      success: true,
      luckyDraw: luckyDraw
    });
  } catch (error) {
    console.error('Error updating lucky draw:', error);
    res.status(500).json({ success: false, error: 'Failed to update lucky draw' });
  }
});

// Update lucky draw status (for admin)
app.patch('/api/admin/lucky-draws/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['scheduled', 'active', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const luckyDraw = await LuckyDraw.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!luckyDraw) {
      return res.status(404).json({ success: false, error: 'Lucky draw not found' });
    }
    
    res.json({
      success: true,
      luckyDraw: luckyDraw
    });
  } catch (error) {
    console.error('Error updating lucky draw status:', error);
    res.status(500).json({ success: false, error: 'Failed to update lucky draw status' });
  }
});

// ==================== PUBLIC LUCKY DRAW ENDPOINTS ====================

// Get active lucky draws (for frontend)
app.get('/api/lucky-draws', async (req, res) => {
  try {
    const now = new Date();
    const luckyDraws = await LuckyDraw.find({
      $or: [
        { status: 'active' },
        { status: 'scheduled', startDate: { $lte: now } } // Include scheduled draws that should be active
      ],
      startDate: { $lte: now },
      endDate: { $gt: now }
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      luckyDraws: luckyDraws
    });
  } catch (error) {
    console.error('Error fetching active lucky draws:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lucky draws' });
  }
});

// Get specific lucky draw by ID (for frontend)
app.get('/api/lucky-draws/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const luckyDraw = await LuckyDraw.findById(id);
    
    if (!luckyDraw) {
      return res.status(404).json({ success: false, error: 'Lucky draw not found' });
    }
    
    res.json({
      success: true,
      luckyDraw: luckyDraw
    });
  } catch (error) {
    console.error('Error fetching lucky draw:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lucky draw' });
  }
});

// Participate in lucky draw
app.post('/api/lucky-draws/:id/participate', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.body;
    
    const luckyDraw = await LuckyDraw.findById(id);
    if (!luckyDraw) {
      return res.status(404).json({ success: false, error: 'Lucky draw not found' });
    }
    
    // Check if lucky draw is active
    const now = new Date();
    if (luckyDraw.status !== 'active' || now < luckyDraw.startDate || now > luckyDraw.endDate) {
      return res.status(400).json({ success: false, error: 'Lucky draw is not active' });
    }
    
    // Check if user has already participated
    const existingParticipation = await Participation.findOne({
      user: req.user._id,
      luckyDrawId: id
    });
    
    if (existingParticipation) {
      return res.status(400).json({ success: false, error: 'You have already participated in this lucky draw' });
    }
    
    // Check if max participants reached
    if (luckyDraw.currentParticipants >= luckyDraw.maxParticipants) {
      return res.status(400).json({ success: false, error: 'Maximum participants reached for this lucky draw' });
    }
    
    // Create participation
    const participation = new Participation({
      user: req.user._id,
      luckyDrawId: id,
      walletAddress,
      submittedButton: null // Pending admin approval
    });
    
    await participation.save();
    
    // Update lucky draw participant count
    await LuckyDraw.findByIdAndUpdate(id, {
      $inc: { currentParticipants: 1 }
    });
    
    res.status(201).json({
      success: true,
      participation: participation
    });
  } catch (error) {
    console.error('Error participating in lucky draw:', error);
    res.status(500).json({ success: false, error: 'Failed to participate in lucky draw' });
  }
});

// ==================== AUTOMATIC CLEANUP ====================

// Function to cleanup expired lucky draws and activate scheduled ones
const cleanupExpiredLuckyDraws = async () => {
  try {
    const now = new Date();
    
    // Mark expired draws as completed
    const expiredDraws = await LuckyDraw.find({
      endDate: { $lt: now },
      status: { $ne: 'completed' }
    });
    
    for (const draw of expiredDraws) {
      await LuckyDraw.findByIdAndUpdate(draw._id, { status: 'completed' });
      console.log(`Marked lucky draw ${draw._id} as completed (expired)`);
    }
    
    // Activate scheduled draws that should be active
    const scheduledDraws = await LuckyDraw.find({
      status: 'scheduled',
      startDate: { $lte: now },
      endDate: { $gt: now }
    });
    
    for (const draw of scheduledDraws) {
      await LuckyDraw.findByIdAndUpdate(draw._id, { status: 'active' });
      console.log(`Activated lucky draw ${draw._id} (scheduled -> active)`);
    }
  } catch (error) {
    console.error('Error cleaning up lucky draws:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredLuckyDraws, 60 * 60 * 1000);

const PORT = process.env.PORT || 3005;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
