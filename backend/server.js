const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');

// Import routes
const customersRouter = require('./routes/customers');
const menuItemsRouter = require('./routes/menuItems');
const ordersRouter = require('./routes/orders');
const orderItemsRouter = require('./routes/orderItems');
const staffRouter = require('./routes/staff');
const logsRouter = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customersRouter);
app.use('/api/menu-items', menuItemsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/order-items', orderItemsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/logs', logsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Restaurant Management System API is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Starting Restaurant Management System Backend...');
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log('🚀 Restaurant Management System is ready!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();