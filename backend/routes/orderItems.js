const express = require('express');
const { getContainer } = require('../config/database');
const { createLoggerMiddleware } = require('../middleware/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const container = getContainer('orderItems');

// Get all order items
router.get('/', createLoggerMiddleware('READ_ALL', 'orderItems'), async (req, res) => {
  try {
    const { resources: orderItems } = await container.items.readAll().fetchAll();
    // Calculate total price for each item
    const itemsWithTotal = orderItems.map(item => ({
      ...item,
      totalPrice: item.quantity * item.price
    }));
    res.json(itemsWithTotal);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// Get order items by order ID
router.get('/order/:orderId', createLoggerMiddleware('READ_BY_ORDER', 'orderItems'), async (req, res) => {
  try {
    const query = `SELECT * FROM c WHERE c.orderId = "${req.params.orderId}"`;
    const { resources: orderItems } = await container.items.query(query).fetchAll();
    const itemsWithTotal = orderItems.map(item => ({
      ...item,
      totalPrice: item.quantity * item.price
    }));
    res.json(itemsWithTotal);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// Get order item by ID
router.get('/:id', createLoggerMiddleware('READ', 'orderItems'), async (req, res) => {
  try {
    const query = `SELECT * FROM c WHERE c.id = "${req.params.id}"`;
    const { resources: orderItems } = await container.items.query(query).fetchAll();
    if (orderItems.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    const item = orderItems[0];
    res.json({
      ...item,
      totalPrice: item.quantity * item.price
    });
  } catch (error) {
    console.error('Error fetching order item:', error);
    res.status(500).json({ error: 'Failed to fetch order item' });
  }
});

// Create new order item
router.post('/', createLoggerMiddleware('CREATE', 'orderItems'), async (req, res) => {
  try {
    const { orderId, menuItemId, quantity, price } = req.body;
    
    if (!orderId || !menuItemId || !quantity || !price) {
      return res.status(400).json({ error: 'Order ID, menu item ID, quantity, and price are required' });
    }

    const orderItem = {
      id: uuidv4(),
      orderId,
      menuItemId,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      totalPrice: parseInt(quantity) * parseFloat(price),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource: createdOrderItem } = await container.items.create(orderItem);
    res.status(201).json(createdOrderItem);
  } catch (error) {
    console.error('Error creating order item:', error);
    res.status(500).json({ error: 'Failed to create order item' });
  }
});

// Update order item
router.put('/:id', createLoggerMiddleware('UPDATE', 'orderItems'), async (req, res) => {
  try {
    const { orderId, menuItemId, quantity, price } = req.body;
    
    if (!orderId || !menuItemId || !quantity || !price) {
      return res.status(400).json({ error: 'Order ID, menu item ID, quantity, and price are required' });
    }

    const query = `SELECT * FROM c WHERE c.id = "${req.params.id}"`;
    const { resources: existingItems } = await container.items.query(query).fetchAll();
    if (existingItems.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    const existingOrderItem = existingItems[0];
    const updatedOrderItem = {
      ...existingOrderItem,
      orderId,
      menuItemId,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      totalPrice: parseInt(quantity) * parseFloat(price),
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await container.item(req.params.id, existingOrderItem.orderId).replace(updatedOrderItem);
    res.json(result);
  } catch (error) {
    console.error('Error updating order item:', error);
    res.status(500).json({ error: 'Failed to update order item' });
  }
});

// Delete order item
router.delete('/:id', createLoggerMiddleware('DELETE', 'orderItems'), async (req, res) => {
  try {
    const query = `SELECT * FROM c WHERE c.id = "${req.params.id}"`;
    const { resources: existingItems } = await container.items.query(query).fetchAll();
    if (existingItems.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    await container.item(req.params.id, existingItems[0].orderId).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order item:', error);
    res.status(500).json({ error: 'Failed to delete order item' });
  }
});

module.exports = router;