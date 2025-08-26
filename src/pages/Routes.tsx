import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Route as RouteIcon, MapPin, Clock, ArrowRight, List, Trash2 } from 'lucide-react';
import { mockRoutes as initialRoutes } from '../data/mockData';
import { Route, Waypoint } from '../types';
import { fakerES as faker } from '@faker-js/faker';
import { Modal } from '../components/common/Modal';

const emptyWaypoint: Omit<Waypoint, 'id' | 'latitude' | 'longitude'> = { name: '', address: '', order: 1 };

export const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id'>>({
    name: '',
    description: '',
    startPoint: '',
    endPoint: '',
    waypoints: [{ ...emptyWaypoint, id: faker.string.uuid(), latitude: 0, longitude: 0 }],
    estimatedDuration: 30,
    distance: 10,
    status: 'active',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    return routes.filter(route =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [routes, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRoute(prev => ({ ...prev, [name]: name === 'estimatedDuration' || name === 'distance' ? parseInt(value) : value }));
  };

  const handleWaypointChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedWaypoints = [...newRoute.waypoints];
    updatedWaypoints[index] = { ...updatedWaypoints[index], [name]: value };
    setNewRoute(prev => ({ ...prev, waypoints: updatedWaypoints }));
  };

  const addWaypoint = () => {
    setNewRoute(prev => ({
      ...prev,
      waypoints: [
        ...prev.waypoints,
        {
          id: faker.string.uuid(),
          name: '',
          address: '',
          order: prev.waypoints.length + 1,
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude()
        }
      ]
    }));
  };

  const removeWaypoint = (index: number) => {
    setNewRoute(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const routeToAdd: Route = {
      ...newRoute,
      id: faker.string.uuid(),
    };
    setRoutes(prev => [routeToAdd, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rutas</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona las rutas de transporte y sus paradas</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nueva Ruta</span>
          </motion.button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de ruta, punto de inicio o fin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 cursor-pointer" onClick={() => setExpandedRouteId(expandedRouteId === route.id ? null : route.id)}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <RouteIcon className="text-indigo-500 mr-3" size={24} />
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">{route.name}</h3>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 space-x-2 text-sm ml-9">
                      <span>{route.startPoint}</span>
                      <ArrowRight size={16} />
                      <span>{route.endPoint}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center"><Clock size={16} className="mr-2" /><span>{route.estimatedDuration} min</span></div>
                    <div className="flex items-center"><MapPin size={16} className="mr-2" /><span>{route.distance} km</span></div>
                    <div className="flex items-center"><List size={16} className="mr-2" /><span>{route.waypoints.length} paradas</span></div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${route.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'}`}>
                      {route.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {expandedRouteId === route.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Paradas</h4>
                      <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">
                        {route.waypoints.sort((a, b) => a.order - b.order).map(waypoint => (
                          <li key={waypoint.id} className="mb-4 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                              <MapPin className="w-3 h-3 text-blue-800 dark:text-blue-300" />
                            </span>
                            <h5 className="font-medium text-gray-900 dark:text-white">{waypoint.name}</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{waypoint.address}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Nueva Ruta" size="3xl">
        <form onSubmit={handleAddRoute}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la Ruta</label>
              <input type="text" name="name" value={newRoute.name} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
              <textarea name="description" value={newRoute.description} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Punto de Inicio</label>
              <input type="text" name="startPoint" value={newRoute.startPoint} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Punto Final</label>
              <input type="text" name="endPoint" value={newRoute.endPoint} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duración Estimada (min)</label>
              <input type="number" name="estimatedDuration" value={newRoute.estimatedDuration} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distancia (km)</label>
              <input type="number" name="distance" value={newRoute.distance} onChange={handleInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Paradas</h3>
              <div className="space-y-4">
                {newRoute.waypoints.map((waypoint, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <span className="text-gray-500">{index + 1}</span>
                    <input type="text" name="name" placeholder="Nombre de la parada" value={waypoint.name} onChange={(e) => handleWaypointChange(index, e)} className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" required />
                    <input type="text" name="address" placeholder="Dirección" value={waypoint.address} onChange={(e) => handleWaypointChange(index, e)} className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" required />
                    <button type="button" onClick={() => removeWaypoint(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
              <button type="button" onClick={addWaypoint} className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                <Plus size={16} className="mr-1" /> Añadir Parada
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button type="button" onClick={() => setIsModalOpen(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium">Cancelar</motion.button>
            <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium">Añadir Ruta</motion.button>
          </div>
        </form>
      </Modal>
    </>
  );
};
