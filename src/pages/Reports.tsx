import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, TrendingUp, CheckCircle, XCircle, Clock, Users, Truck, UserCheck } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { mockTrips, mockVehicles, mockDrivers, mockPassengers } from '../data/mockData';
import { useTheme } from '../contexts/ThemeContext';

export const Reports: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [dateRange, setDateRange] = useState({
    start: '2025-01-01',
    end: new Date().toISOString().split('T')[0]
  });

  const reportData = useMemo(() => {
    const trips = mockTrips; // In a real app, filter by dateRange
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const cancelledTrips = trips.filter(t => t.status === 'cancelled').length;
    const inProgressTrips = trips.filter(t => t.status === 'in-progress').length;
    const scheduledTrips = trips.filter(t => t.status === 'scheduled').length;
    
    const completionRate = totalTrips > 0 ? (completedTrips / totalTrips * 100).toFixed(1) : '0';
    const onTimeRate = '95.4'; // Mock data for now
    const totalPassengers = trips.reduce((acc, trip) => acc + trip.passengers.length, 0);

    const vehicleStatus = mockVehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDrivers = mockDrivers
      .sort((a, b) => b.totalTrips - a.totalTrips)
      .slice(0, 5);

    return {
      totalTrips,
      completedTrips,
      cancelledTrips,
      inProgressTrips,
      scheduledTrips,
      completionRate,
      onTimeRate,
      totalPassengers,
      vehicleStatus,
      topDrivers,
    };
  }, [dateRange]);

  const chartTheme = isDarkMode ? 'dark' : 'light';

  const tripsByStatusOptions = {
    theme: chartTheme,
    tooltip: { trigger: 'axis' },
    legend: { data: ['Viajes'] },
    xAxis: {
      type: 'category',
      data: ['Completados', 'En Curso', 'Programados', 'Cancelados'],
    },
    yAxis: { type: 'value' },
    series: [{
      name: 'Viajes',
      type: 'bar',
      data: [
        reportData.completedTrips, 
        reportData.inProgressTrips, 
        reportData.scheduledTrips, 
        reportData.cancelledTrips
      ],
      itemStyle: {
        color: (params: any) => ['#34d399', '#60a5fa', '#a78bfa', '#f87171'][params.dataIndex]
      }
    }],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
  };

  const vehicleStatusOptions = {
    theme: chartTheme,
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      name: 'Estado de Vehículos',
      type: 'pie',
      radius: '50%',
      data: [
        { value: reportData.vehicleStatus.active || 0, name: 'Activos' },
        { value: reportData.vehicleStatus.maintenance || 0, name: 'Mantenimiento' },
        { value: reportData.vehicleStatus.inactive || 0, name: 'Inactivos' },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const statsCards = [
    { label: 'Total Viajes', value: reportData.totalTrips, icon: TrendingUp },
    { label: 'Tasa de Finalización', value: `${reportData.completionRate}%`, icon: CheckCircle },
    { label: 'Puntualidad', value: `${reportData.onTimeRate}%`, icon: Clock },
    { label: 'Total Pasajeros', value: reportData.totalPassengers, icon: Users },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reportes y Analíticas</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualiza el rendimiento y las métricas clave de tus operaciones.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl" />
          </div>
          <span className="text-gray-500">-</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl" />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2">
            <Download size={18} />
            <span>Descargar</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <card.icon className="text-blue-500" size={28} />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mt-2">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Viajes por Estado</h2>
          <ReactECharts option={tripsByStatusOptions} style={{ height: '300px' }} theme={chartTheme} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Estado de la Flota</h2>
          <ReactECharts option={vehicleStatusOptions} style={{ height: '300px' }} theme={chartTheme} />
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top 5 Conductores por Viajes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conductor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Viajes Totales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.topDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full" src={driver.avatar} alt={driver.name} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{driver.name}</div>
                        <div className="text-sm text-gray-500">{driver.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{driver.totalTrips}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{driver.rating.toFixed(1)} ⭐</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {driver.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
