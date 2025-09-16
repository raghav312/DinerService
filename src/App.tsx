import React, { useState } from 'react';
import { Users, Menu, ShoppingCart, ClipboardList, UserCheck, Activity, Home } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomersManager from './components/CustomersManager';
import MenuItemsManager from './components/MenuItemsManager';
import OrdersManager from './components/OrdersManager';
import OrderItemsManager from './components/OrderItemsManager';
import StaffManager from './components/StaffManager';
import LogsViewer from './components/LogsViewer';
import Notification from './components/Notification';

type Page = 'dashboard' | 'customers' | 'menu-items' | 'orders' | 'order-items' | 'staff' | 'logs';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'menu-items', label: 'Menu Items', icon: Menu },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'order-items', label: 'Order Items', icon: ClipboardList },
  { id: 'staff', label: 'Staff', icon: UserCheck },
  { id: 'logs', label: 'Activity Logs', icon: Activity },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomersManager showNotification={showNotification} />;
      case 'menu-items':
        return <MenuItemsManager showNotification={showNotification} />;
      case 'orders':
        return <OrdersManager showNotification={showNotification} />;
      case 'order-items':
        return <OrderItemsManager showNotification={showNotification} />;
      case 'staff':
        return <StaffManager showNotification={showNotification} />;
      case 'logs':
        return <LogsViewer showNotification={showNotification} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        navigationItems={navigationItems}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;