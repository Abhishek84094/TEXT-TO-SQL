const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Catch unexpected crashes
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
});

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const dbRoutes = require('./src/routes/db.routes');
const queryRoutes = require('./src/routes/query.routes');

app.use('/api/db', dbRoutes);
app.use('/api/query', queryRoutes);

// Error Middleware
const errorHandler = require('./src/middlewares/error.middleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use! Kill the other process first.`);
    } else {
        console.error('Server error:', err);
    }
});

// Keep process alive
server.keepAliveTimeout = 65000;
