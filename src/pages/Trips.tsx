import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, User, Truck, Users as PassengersIcon } from 'lucide-react';
import { mockTrips as initialTrips, mockRoutes, mockDrivers, mockVehicles } from '../data/mockData';
import { Trip } from '../types';
import { fakerES as faker } from '@faker-js/faker';
import { Modal } from '../components/common/Modal';

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const emptyTrip: Omit<Trip, 'id' | 'passengers'> = {
    routeId: '',
    driverId: '',
    vehicleId: '',
    scheduledDeparture: '',
    scheduledArrival: '',
    status: 'scheduled',
  };
  const [newTrip, setNewTrip] = useState(emptyTrip);

  const availableDrivers = useMemo(() => mockDrivers.filter(d => d.status === 'active'), []);
  const availableVehicles = useMemo(() => mockVehicles.filter(v => v.status === 'active'), []);

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const route = mockRoutes.find(r => r.id === trip.routeId);
      const driver = mockDrivers.find(d => d.id === trip.driverId);
      
      const matchesSearch = 
        route?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [trips, searchTerm, statusFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTrip(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.routeId || !newTrip.driverId || !newTrip.vehicleId) {
      alert("Por favor, complete todos los campos requeridos.");
      return;
    }
    const tripToAdd: Trip = {
      ...newTrip,
      id: faker.string.uuid(),
      passengers: [], // Passengers would be added during the trip
    };
    setTrips(prev => [tripToAdd, ...prev]);
    setIsModalOpen(false);
    setNewTrip(emptyTrip);
  };

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'scheduled': return { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400', text: 'Programado' };
      case 'in-progress': return { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400', text: 'En Curso' };
      case 'completed': return { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400', text: 'Completado' };
      case 'cancelled': return { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400', text: 'Cancelado' };
      default: return { color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400', text: status };
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Viajes</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona y monitorea todos los viajes programados</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nuevo Viaje</span>
          </motion.button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ruta o conductor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los Estados</option>
                <option value="scheduled">Programado</option>
                <option value="in-progress">En Curso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, index) => {
            const route = mockRoutes.find(r => r.id === trip.routeId);
            const driver = mockDrivers.find(d => d.id === trip.driverId);
            const vehicle = mockVehicles.find(v => v.id === trip.vehicleId);
            const status = getStatusProps(trip.status);

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{route?.name || 'Ruta no encontrada'}</h3>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${status.color}`}>{status.text}</span>
                </div>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center"><User size={14} className="mr-2" /><span>{driver?.name || 'Conductor no asignado'}</span></div>
                  <div className="flex items-center"><Truck size={14} className="mr-2" /><span>{vehicle?.plateNumber || 'Vehículo no asignado'}</span></div>
                  <div className="flex items-center"><PassengersIcon size={14} className="mr-2" /><span>{trip.passengers.length} Pasajeros</span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Salida: {new Date(trip.scheduledDeparture).toLocaleString()}</span>
                    <span>Llegada: {new Date(trip.scheduledArrival).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Programar Nuevo Viaje">
        <form onSubmit={handleAddTrip} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ruta</label>
            <select name="routeId" value={newTrip.routeId} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required>
              <option value="">Seleccionar ruta</option>
              {mockRoutes.map(route => <option key={route.id} value={route.id}>{route.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conductor</label>
            <select name="driverId" value={newTrip.driverId} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required>
              <option value="">Seleccionar conductor</option>
              {availableDrivers.map(driver => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vehículo</label>
            <select name="vehicleId" value={newTrip.vehicleId} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required>
              <option value="">Seleccionar vehículo</option>
              {availableVehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} ({vehicle.plateNumber})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salida Programada</label>
              <input type="datetime-local" name="scheduledDeparture" value={newTrip.scheduledDeparture} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Llegada Programada</label>
              <input type="datetime-local" name="scheduledArrival" value={newTrip.scheduledArrival} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <motion.button type="button" onClick={() => setIsModalOpen(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium">Cancelar</motion.button>
            <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium">Programar Viaje</motion.button>
          </div>
        </form>
      </Modal>
    </>
  );
};
