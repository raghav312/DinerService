import React from 'react';
import { ChefHat, DivideIcon as LucideIcon } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  navigationItems: NavigationItem[];
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems, currentPage, onPageChange }) => {
  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ChefHat className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">RestaurantDB</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="bg-gradient-to-r from-orange-50 to-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">CosmosDB</span> Connected
          </p>
          <p className="text-xs text-gray-500 mt-1">All operations logged</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;