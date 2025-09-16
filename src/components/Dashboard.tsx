import React, { useState, useEffect } from 'react';
import { Users, Menu, ShoppingCart, UserCheck, Activity, TrendingUp } from 'lucide-react';
import api from '../services/api';

interface Stats {
  customers: number;
  menuItems: number;
  orders: number;
  staff: number;
  totalRevenue: number;
  recentActivity: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    customers: 0,
    menuItems: 0,
    orders: 0,
    staff: 0,
    totalRevenue: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [customersRes, menuItemsRes, ordersRes, staffRes, logsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/menu-items'),
        api.get('/orders'),
        api.get('/staff'),
        api.get('/logs?limit=10')
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      setStats({
        customers: Array.isArray(customersRes.data) ? customersRes.data.length : 0,
        menuItems: Array.isArray(menuItemsRes.data) ? menuItemsRes.data.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        staff: Array.isArray(staffRes.data) ? staffRes.data.length : 0,
        totalRevenue,
        recentActivity: Array.isArray(logsRes.data) ? logsRes.data.length : 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.customers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Menu Items',
      value: stats.menuItems,
      icon: Menu,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Total Orders',
      value: stats.orders,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: 'Staff Members',
      value: stats.staff,
      icon: UserCheck,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: Activity,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadDashboardStats}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 text-white ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Customer</span>
          </button>
          <button className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-center">
            <Menu className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Menu Item</span>
          </button>
          <button className="p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-center">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm font-medium">New Order</span>
          </button>
          <button className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-center">
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm font-medium">View Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;