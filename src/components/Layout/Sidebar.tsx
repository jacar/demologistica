import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  UserCheck, 
  Truck, 
  Route, 
  MapPin, 
  QrCode, 
  FileText, 
  Settings,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  closeMobileMenu: () => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'drivers', label: 'Conductores', icon: UserCheck },
  { id: 'passengers', label: 'Pasajeros', icon: Users },
  { id: 'vehicles', label: 'Vehículos', icon: Truck },
  { id: 'routes', label: 'Rutas', icon: Route },
  { id: 'trips', label: 'Viajes', icon: MapPin },
  { id: 'qr-scanner', label: 'Escáner QR', icon: QrCode },
  { id: 'reports', label: 'Reportes', icon: FileText },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isExpanded, 
  onToggle,
  closeMobileMenu
}) => {
  const location = useLocation();

  return (
    <motion.div 
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col shadow-lg"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <motion.div 
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3 overflow-hidden"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">TransportApp</span>
          </motion.div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </motion.div>
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const path = `/${item.id}`;
          const isActive = location.pathname === path || (path === '/dashboard' && location.pathname === '/');
          
          return (
            <Link to={path} key={item.id} onClick={closeMobileMenu}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={20} />
                <motion.span
                  animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <motion.div
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-center overflow-hidden"
        >
          <p className="text-xs text-gray-500 whitespace-nowrap">
            TransportApp v1.0
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
