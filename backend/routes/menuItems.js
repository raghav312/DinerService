const express = require('express');
const { getContainer } = require('../config/database');
const { createLoggerMiddleware } = require('../middleware/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const container = getContainer('menuItems');

// Get all menu items
router.get('/', createLoggerMiddleware('READ_ALL', 'menuItems'), async (req, res) => {
  try {
    const { resources: menuItems } = await container.items.readAll().fetchAll();
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get menu item by ID
router.get('/:id', createLoggerMiddleware('READ', 'menuItems'), async (req, res) => {
  try {
    const { resource: menuItem } = await container.item(req.params.id, req.params.id).read();
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create new menu item
router.post('/', createLoggerMiddleware('CREATE', 'menuItems'), async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const menuItem = {
      id: uuidv4(),
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      available: available !== undefined ? available : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource: createdMenuItem } = await container.items.create(menuItem);
    res.status(201).json(createdMenuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
router.put('/:id', createLoggerMiddleware('UPDATE', 'menuItems'), async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const { resource: existingMenuItem } = await container.item(req.params.id, req.params.id).read();
    if (!existingMenuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const updatedMenuItem = {
      ...existingMenuItem,
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      available: available !== undefined ? available : true,
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await container.item(req.params.id, req.params.id).replace(updatedMenuItem);
    res.json(result);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
router.delete('/:id', createLoggerMiddleware('DELETE', 'menuItems'), async (req, res) => {
  try {
    await container.item(req.params.id, req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

module.exports = router;