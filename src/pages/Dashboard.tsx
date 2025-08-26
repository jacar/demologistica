import React from 'react';
import { motion } from 'framer-motion';
import { Users, Truck, MapPin, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { mockTrips, mockDrivers, mockVehicles, mockPassengers } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const stats = [
    { 
      label: 'Viajes Activos', 
      value: mockTrips.filter(t => t.status === 'in-progress').length, 
      icon: MapPin, 
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    { 
      label: 'Conductores', 
      value: mockDrivers.filter(d => d.status === 'active').length, 
      icon: Users, 
      color: 'from-green-500 to-green-600',
      change: '+3%'
    },
    { 
      label: 'Vehículos', 
      value: mockVehicles.filter(v => v.status === 'active').length, 
      icon: Truck, 
      color: 'from-purple-500 to-purple-600',
      change: '+1%'
    },
    { 
      label: 'Pasajeros Hoy', 
      value: '247', 
      icon: Clock, 
      color: 'from-orange-500 to-orange-600',
      change: '+8%'
    },
  ];

  const activeTrips = mockTrips.filter(trip => trip.status === 'in-progress');
  const scheduledTrips = mockTrips.filter(trip => trip.status === 'scheduled');

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Resumen general del sistema de transporte</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Trips */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Viajes en Curso</h2>
            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              {activeTrips.length} activos
            </span>
          </div>
          
          <div className="space-y-4">
            {activeTrips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Ruta {trip.routeId}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Conductor: {mockDrivers.find(d => d.id === trip.driverId)?.name}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Salida: {new Date(trip.scheduledDeparture).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Pasajeros: {trip.passengers.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-lg text-xs font-medium">
                      En curso
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scheduled Trips */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Próximos Viajes</h2>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
              {scheduledTrips.length} programados
            </span>
          </div>
          
          <div className="space-y-4">
            {scheduledTrips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Ruta {trip.routeId}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Conductor: {mockDrivers.find(d => d.id === trip.driverId)?.name}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Salida: {new Date(trip.scheduledDeparture).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Pasajeros: {trip.passengers.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400 px-2 py-1 rounded-lg text-xs font-medium">
                      Programado
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl transition-colors text-left">
              Crear Nuevo Viaje
            </button>
            <button className="w-full bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl transition-colors text-left">
              Registrar Conductor
            </button>
            <button className="w-full bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl transition-colors text-left">
              Generar Reporte
            </button>
          </div>
        </motion.div>

        {/* Vehicle Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado de Vehículos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Activos</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                {mockVehicles.filter(v => v.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mantenimiento</span>
              <span className="text-orange-600 dark:text-orange-400 font-semibold">
                {mockVehicles.filter(v => v.status === 'maintenance').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Inactivos</span>
              <span className="text-red-600 dark:text-red-400 font-semibold">
                {mockVehicles.filter(v => v.status === 'inactive').length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle size={20} className="text-orange-500 mr-2" />
            Alertas
          </h3>
          <div className="space-y-3">
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-orange-800 dark:text-orange-400 text-sm">
                Vehículo ABC-123 requiere mantenimiento
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                Licencia de conductor vence en 5 días
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
