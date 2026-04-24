const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/booksRoutes.js');
const borrowRoutes = require('./routes/borrowRoutes.js');
const fineRoutes = require('./routes/finesRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: err.message 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
});