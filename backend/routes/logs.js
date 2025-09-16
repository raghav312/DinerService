const express = require('express');
const { getContainer } = require('../config/database');

const router = express.Router();
const container = getContainer('logs');

// Get all logs with optional filtering
router.get('/', async (req, res) => {
  try {
    const { action, table, search, limit } = req.query;
    
    let query = 'SELECT * FROM c';
    const conditions = [];
    
    if (action) {
      conditions.push(`c.action = "${action}"`);
    }
    
    if (table) {
      conditions.push(`c.table = "${table}"`);
    }
    
    if (search) {
      conditions.push(`(CONTAINS(UPPER(c.action), UPPER("${search}")) OR CONTAINS(UPPER(c.table), UPPER("${search}")) OR CONTAINS(UPPER(c.data), UPPER("${search}")))`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY c.timestamp DESC';
    
    if (limit) {
      query += ` OFFSET 0 LIMIT ${parseInt(limit)}`;
    }
    
    const { resources: logs } = await container.items.query(query).fetchAll();
    res.json(Array.isArray(logs) ? logs : []);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get log statistics
router.get('/stats', async (req, res) => {
  try {
    const { resources: logs } = await container.items.readAll().fetchAll();
    
    const successErrorBreakdown = [
      { success: true, count: logs.filter(log => log.success).length },
      { success: false, count: logs.filter(log => !log.success).length }
    ];
    
    const actionBreakdown = {};
    const tableBreakdown = {};
    
    logs.forEach(log => {
      actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
      tableBreakdown[log.table] = (tableBreakdown[log.table] || 0) + 1;
    });
    
    const stats = {
      totalLogs: logs.length,
      successErrorBreakdown,
      actionBreakdown: Object.entries(actionBreakdown).map(([action, count]) => ({ action, count })),
      tableBreakdown: Object.entries(tableBreakdown).map(([table, count]) => ({ table, count }))
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching log statistics:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
});

// Get log by ID
router.get('/:id', async (req, res) => {
  try {
    const { resource: log } = await container.item(req.params.id, req.params.id).read();
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json(log);
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
});

module.exports = router;