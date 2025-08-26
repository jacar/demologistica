import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Fuel, Users, Calendar, Wrench, ShieldAlert, LoaderCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import { Modal } from '../components/common/Modal';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type NewVehicle = Database['public']['Tables']['vehicles']['Insert'];

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newVehicle, setNewVehicle] = useState<Omit<NewVehicle, 'id' | 'created_at'>>({
    plate_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: 12,
    fuel_type: 'Diesel',
    status: 'active',
    last_maintenance: new Date().toISOString(),
    next_maintenance: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      setError('No se pudieron cargar los vehículos. Por favor, inténtelo de nuevo.');
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: name === 'year' || name === 'capacity' ? parseInt(value) : value }));
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('vehicles').insert([newVehicle]);
    
    if (error) {
      console.error('Error adding vehicle:', error);
      alert(`Error al añadir el vehículo: ${error.message}`);
    } else {
      setIsModalOpen(false);
      fetchVehicles();
    }
  };

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'active': return { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400', text: 'Activo' };
      case 'maintenance': return { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400', text: 'Mantenimiento' };
      case 'inactive': return { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400', text: 'Inactivo' };
      default: return { color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400', text: status };
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Vehículos</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona la flota de vehículos y su mantenimiento</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nuevo Vehículo</span>
          </motion.button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar vehículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              >
                <option value="all">Todos los Estados</option>
                <option value="active">Activos</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Total: {filteredVehicles.length} vehículos</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoaderCircle size={48} className="animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg border border-red-200 dark:border-red-700">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">Error al cargar datos</h3>
            <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle, index) => {
              const status = getStatusProps(vehicle.status);
              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">{vehicle.plate_number}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${status.color}`}>{status.text}</span>
                  </div>
                  <div className="space-y-3 mb-4 flex-grow">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Users size={14} className="mr-2" /><span>Capacidad: {vehicle.capacity} pasajeros</span></div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Fuel size={14} className="mr-2" /><span>Combustible: {vehicle.fuel_type}</span></div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Calendar size={14} className="mr-2" /><span>Último mtto: {vehicle.last_maintenance ? new Date(vehicle.last_maintenance).toLocaleDateString() : 'N/A'}</span></div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Wrench size={14} className="mr-2" /><span>Próximo mtto: {vehicle.next_maintenance ? new Date(vehicle.next_maintenance).toLocaleDateString() : 'N/A'}</span></div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400"><ShieldAlert size={14} className="mr-2" /><span>Sin conductor asignado</span></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No se encontraron vehículos</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Intenta ajustar los filtros o añade un nuevo vehículo.</p>
          </motion.div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Nuevo Vehículo">
        <form onSubmit={handleAddVehicle} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Matrícula</label>
            <input type="text" name="plate_number" value={newVehicle.plate_number} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marca</label>
            <input type="text" name="brand" value={newVehicle.brand} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modelo</label>
            <input type="text" name="model" value={newVehicle.model} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Año</label>
            <input type="number" name="year" value={newVehicle.year} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacidad</label>
            <input type="number" name="capacity" value={newVehicle.capacity} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Combustible</label>
            <select name="fuel_type" value={newVehicle.fuel_type} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
              <option>Diesel</option>
              <option>Gasolina</option>
              <option>Eléctrico</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
            <select name="status" value={newVehicle.status} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
              <option value="active">Activo</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
            <motion.button type="button" onClick={() => setIsModalOpen(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium">Cancelar</motion.button>
            <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium">Añadir Vehículo</motion.button>
          </div>
        </form>
      </Modal>
    </>
  );
};
