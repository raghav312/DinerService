import React, { useState, useEffect } from 'react';
import { Search, Filter, Activity, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import api from '../services/api';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  table: string;
  data: string | null;
  result: string | null;
  error: string | null;
  success: boolean;
  userAgent: string;
}

interface LogStats {
  totalLogs: number;
  successErrorBreakdown: { success: boolean; count: number }[];
  actionBreakdown: { action: string; count: number }[];
  tableBreakdown: { table: string; count: number }[];
}

interface LogsViewerProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const LogsViewer: React.FC<LogsViewerProps> = ({ showNotification }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterSuccess, setFilterSuccess] = useState('');
  
  const actions = ['CREATE', 'READ', 'READ_ALL', 'UPDATE', 'DELETE', 'READ_BY_ORDER'];
  const tables = ['customers', 'menuItems', 'orders', 'orderItems', 'staff'];

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [searchTerm, filterAction, filterTable, filterSuccess]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterAction) params.append('action', filterAction);
      if (filterTable) params.append('table', filterTable);
      
      const response = await api.get(`/logs?${params.toString()}`);
      console.log('Fetched logs:', response.data);
      setLogs(Array.isArray(response) ? response : []);
    } catch (error) {
      showNotification('Failed to load logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/logs/stats');
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      CREATE: 'bg-green-100 text-green-800',
      READ: 'bg-blue-100 text-blue-800',
      READ_ALL: 'bg-blue-100 text-blue-800',
      READ_BY_ORDER: 'bg-blue-100 text-blue-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getTableColor = (table: string) => {
    const colors: { [key: string]: string } = {
      customers: 'bg-blue-50 text-blue-700',
      menuItems: 'bg-green-50 text-green-700',
      orders: 'bg-orange-50 text-orange-700',
      orderItems: 'bg-purple-50 text-purple-700',
      staff: 'bg-emerald-50 text-emerald-700'
    };
    return colors[table] || 'bg-gray-50 text-gray-700';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('');
    setFilterTable('');
    setFilterSuccess('');
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    if (filterSuccess !== '') {
      return log.success === (filterSuccess === 'true');
    }
    return true;
  }) : [];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
          <button
            onClick={() => { loadLogs(); loadStats(); }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalLogs > 0 
                    ? Math.round((stats.successErrorBreakdown.find(s => s.success)?.count || 0) / stats.totalLogs * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.successErrorBreakdown.find(s => !s.success)?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Most Active</p>
                <p className="text-lg font-bold text-purple-600">
                  {stats.tableBreakdown.length > 0 
                    ? stats.tableBreakdown.sort((a, b) => b.count - a.count)[0].table
                    : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tables</option>
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          
          <select
            value={filterSuccess}
            onChange={(e) => setFilterSuccess(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Results</option>
            <option value="true">Success Only</option>
            <option value="false">Errors Only</option>
          </select>

          <div className="flex items-center justify-center">
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading logs...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTableColor(log.table)}`}>
                        {log.table}
                      </span>
                      <div className="flex items-center space-x-2">
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                          {log.success ? 'Success' : 'Error'}
                        </span>
                      </div>
                    </div>
                    
                    {log.data && (
                      <div className="text-sm text-gray-600">
                        <strong>Data:</strong> {log.data.length > 100 ? log.data.substring(0, 100) + '...' : log.data}
                      </div>
                    )}
                    
                    {log.error && (
                      <div className="text-sm text-red-600">
                        <strong>Error:</strong> {log.error}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 ml-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No logs found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsViewer;