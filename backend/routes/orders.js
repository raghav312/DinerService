const express = require('express');
const { getContainer } = require('../config/database');
const { createLoggerMiddleware } = require('../middleware/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const container = getContainer('orders');

// Get all orders
router.get('/', createLoggerMiddleware('READ_ALL', 'orders'), async (req, res) => {
  try {
    const { resources: orders } = await container.items.readAll().fetchAll();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', createLoggerMiddleware('READ', 'orders'), async (req, res) => {
  try {
    const { resource: order } = await container.item(req.params.id, req.params.id).read();
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create new order
router.post('/', createLoggerMiddleware('CREATE', 'orders'), async (req, res) => {
  try {
    const { customerId, totalAmount, status, orderDate } = req.body;
    
    if (!customerId || !totalAmount) {
      return res.status(400).json({ error: 'Customer ID and total amount are required' });
    }

    const order = {
      id: uuidv4(),
      customerId,
      totalAmount: parseFloat(totalAmount),
      status: status || 'pending',
      orderDate: orderDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource: createdOrder } = await container.items.create(order);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order
router.put('/:id', createLoggerMiddleware('UPDATE', 'orders'), async (req, res) => {
  try {
    const { customerId, totalAmount, status, orderDate } = req.body;
    
    if (!customerId || !totalAmount) {
      return res.status(400).json({ error: 'Customer ID and total amount are required' });
    }

    const { resource: existingOrder } = await container.item(req.params.id, req.params.id).read();
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = {
      ...existingOrder,
      customerId,
      totalAmount: parseFloat(totalAmount),
      status: status || 'pending',
      orderDate: orderDate || existingOrder.orderDate,
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await container.item(req.params.id, req.params.id).replace(updatedOrder);
    res.json(result);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete order
router.delete('/:id', createLoggerMiddleware('DELETE', 'orders'), async (req, res) => {
  try {
    await container.item(req.params.id, req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;