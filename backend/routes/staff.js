const express = require('express');
const { getContainer } = require('../config/database');
const { createLoggerMiddleware } = require('../middleware/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const container = getContainer('staff');

// Get all staff
router.get('/', createLoggerMiddleware('READ_ALL', 'staff'), async (req, res) => {
  try {
    const { resources: staff } = await container.items.readAll().fetchAll();
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Get staff by ID
router.get('/:id', createLoggerMiddleware('READ', 'staff'), async (req, res) => {
  try {
    const { resource: staffMember } = await container.item(req.params.id, req.params.id).read();
    if (!staffMember) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json(staffMember);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// Create new staff member
router.post('/', createLoggerMiddleware('CREATE', 'staff'), async (req, res) => {
  try {
    const { name, email, phone, position, salary, hireDate } = req.body;
    
    if (!name || !email || !position) {
      return res.status(400).json({ error: 'Name, email, and position are required' });
    }

    const staffMember = {
      id: uuidv4(),
      name,
      email,
      phone: phone || '',
      position,
      salary: salary ? parseFloat(salary) : 0,
      hireDate: hireDate || new Date().toISOString(),
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource: createdStaffMember } = await container.items.create(staffMember);
    res.status(201).json(createdStaffMember);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// Update staff member
router.put('/:id', createLoggerMiddleware('UPDATE', 'staff'), async (req, res) => {
  try {
    const { name, email, phone, position, salary, hireDate, active } = req.body;
    
    if (!name || !email || !position) {
      return res.status(400).json({ error: 'Name, email, and position are required' });
    }

    const { resource: existingStaffMember } = await container.item(req.params.id, req.params.id).read();
    if (!existingStaffMember) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const updatedStaffMember = {
      ...existingStaffMember,
      name,
      email,
      phone: phone || '',
      position,
      salary: salary ? parseFloat(salary) : 0,
      hireDate: hireDate || existingStaffMember.hireDate,
      active: active !== undefined ? active : true,
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await container.item(req.params.id, req.params.id).replace(updatedStaffMember);
    res.json(result);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Delete staff member
router.delete('/:id', createLoggerMiddleware('DELETE', 'staff'), async (req, res) => {
  try {
    await container.item(req.params.id, req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

module.exports = router;