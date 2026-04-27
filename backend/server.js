const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

const authRoutes = require('./src/routes/authRoutes');
const libraryRoutes = require('./src/routes/libraryRoutes');

const app = express();

// Security Headers
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Standard Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// API Routes
app.use('/api/auth', authRoutes); // Keep for modern if needed
app.use('/api/library', libraryRoutes); // Keep for modern if needed

// Compatibility with legacy frontend paths
app.use('/api', authRoutes);
app.use('/api', libraryRoutes);

// Static Assets
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// SPA Wildcard
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    // Try to serve index.html from dist, if not found, we'll hit error handler
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
        if (err) {
            // If dist/index.html doesn't exist (e.g. dev mode or not built), fallback or error
            res.status(404).send('Frontend not built. Please run "npm run build" in the frontend directory.');
        }
    });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
