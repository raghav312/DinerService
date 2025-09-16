const express = require('express');
const { getContainer } = require('../config/database');
const { createLoggerMiddleware } = require('../middleware/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const container = getContainer('customers');

// Get all customers
router.get('/', createLoggerMiddleware('READ_ALL', 'customers'), async (req, res) => {
  try {
    const { resources: customers } = await container.items.readAll().fetchAll();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', createLoggerMiddleware('READ', 'customers'), async (req, res) => {
  try {
    const { resource: customer } = await container.item(req.params.id, req.params.id).read();
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', createLoggerMiddleware('CREATE', 'customers'), async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const customer = {
      id: uuidv4(),
      name,
      email,
      phone: phone || '',
      address: address || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource: createdCustomer } = await container.items.create(customer);
    res.status(201).json(createdCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', createLoggerMiddleware('UPDATE', 'customers'), async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const { resource: existingCustomer } = await container.item(req.params.id, req.params.id).read();
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = {
      ...existingCustomer,
      name,
      email,
      phone: phone || '',
      address: address || '',
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await container.item(req.params.id, req.params.id).replace(updatedCustomer);
    res.json(result);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', createLoggerMiddleware('DELETE', 'customers'), async (req, res) => {
  try {
    await container.item(req.params.id, req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;