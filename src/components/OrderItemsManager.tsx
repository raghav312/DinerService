import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ShoppingCart, Package } from 'lucide-react';
import api from '../services/api';

interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
}

interface OrderItemsManagerProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const OrderItemsManager: React.FC<OrderItemsManagerProps> = ({ showNotification }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [formData, setFormData] = useState({
    orderId: '',
    menuItemId: '',
    quantity: '1',
    price: ''
  });

  useEffect(() => {
    loadOrderItems();
    loadOrders();
    loadMenuItems();
    loadCustomers();
  }, []);

  const loadOrderItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/order-items');
      setOrderItems(Array.isArray(response) ? response : []);
    } catch (error) {
      showNotification('Failed to load order items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load orders', error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await api.get('/menu-items');
      setMenuItems(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load menu items', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  };

  const getOrderInfo = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { customerName: 'Unknown Order', amount: 0 };
    
    const customer = customers.find(c => c.id === order.customerId);
    return {
      customerName: customer ? customer.name : 'Unknown Customer',
      amount: order.totalAmount
    };
  };

  const getMenuItemName = (menuItemId: string) => {
    const menuItem = menuItems.find(m => m.id === menuItemId);
    return menuItem ? menuItem.name : 'Unknown Item';
  };

  const handleMenuItemChange = (menuItemId: string) => {
    const menuItem = menuItems.find(m => m.id === menuItemId);
    setFormData({
      ...formData,
      menuItemId,
      price: menuItem ? menuItem.price.toString() : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        orderId: formData.orderId,
        menuItemId: formData.menuItemId,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price)
      };

      if (editingItem) {
        await api.put(`/order-items/${editingItem.id}`, submitData);
        showNotification('Order item updated successfully', 'success');
      } else {
        await api.post('/order-items', submitData);
        showNotification('Order item created successfully', 'success');
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ orderId: '', menuItemId: '', quantity: '1', price: '' });
      loadOrderItems();
    } catch (error) {
      showNotification('Failed to save order item', 'error');
    }
  };

  const handleEdit = (item: OrderItem) => {
    setEditingItem(item);
    setFormData({
      orderId: item.orderId,
      menuItemId: item.menuItemId,
      quantity: item.quantity.toString(),
      price: item.price.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order item?')) return;
    
    try {
      await api.delete(`/order-items/${id}`);
      showNotification('Order item deleted successfully', 'success');
      loadOrderItems();
    } catch (error) {
      showNotification('Failed to delete order item', 'error');
    }
  };

  const filteredOrderItems = orderItems.filter(item => {
    const orderInfo = getOrderInfo(item.orderId);
    const menuItemName = getMenuItemName(item.menuItemId);
    
    const matchesSearch = orderInfo.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         menuItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrder = filterOrder === '' || item.orderId === filterOrder;
    
    return matchesSearch && matchesOrder;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Order Items</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({ orderId: '', menuItemId: '', quantity: '1', price: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Order Item</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search order items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <select
            value={filterOrder}
            onChange={(e) => setFilterOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Orders</option>
            {orders.map(order => {
              const orderInfo = getOrderInfo(order.id);
              return (
                <option key={order.id} value={order.id}>
                  {orderInfo.customerName} - ${orderInfo.amount.toFixed(2)}
                </option>
              );
            })}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading order items...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Menu Item</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrderItems.map((item) => {
                  const orderInfo = getOrderInfo(item.orderId);
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <ShoppingCart className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{orderInfo.customerName}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {item.orderId.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{getMenuItemName(item.menuItemId)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-green-600 font-semibold">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-green-700 font-bold">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingItem ? 'Edit Order Item' : 'Add New Order Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  required
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Order</option>
                  {orders.map(order => {
                    const orderInfo = getOrderInfo(order.id);
                    return (
                      <option key={order.id} value={order.id}>
                        {orderInfo.customerName} - ${orderInfo.amount.toFixed(2)}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Item</label>
                <select
                  required
                  value={formData.menuItemId}
                  onChange={(e) => handleMenuItemChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Menu Item</option>
                  {menuItems.map(menuItem => (
                    <option key={menuItem.id} value={menuItem.id}>
                      {menuItem.name} - ${menuItem.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              {formData.price && formData.quantity && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-700">
                    Total Price: <span className="font-semibold">
                      ${(parseFloat(formData.price) * parseInt(formData.quantity || '0')).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItemsManager;