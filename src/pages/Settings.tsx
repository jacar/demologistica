import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, LoaderCircle } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];

export const Settings: React.FC = () => {
  const [vehicleFile, setVehicleFile] = useState<File | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleFeedback, setVehicleFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVehicleFile(e.target.files[0]);
      setVehicleFeedback(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setVehicleFile(e.dataTransfer.files[0]);
      setVehicleFeedback(null);
    }
  };

  const handleVehicleImport = async () => {
    if (!vehicleFile) {
      setVehicleFeedback({ type: 'error', message: 'Por favor, selecciona un archivo primero.' });
      return;
    }

    setVehicleLoading(true);
    setVehicleFeedback(null);

    Papa.parse(vehicleFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const requiredColumns = ['plate_number', 'brand', 'model', 'year', 'capacity', 'fuel_type', 'status'];
        const headers = results.meta.fields || [];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          setVehicleFeedback({ type: 'error', message: `Faltan las siguientes columnas en el CSV: ${missingColumns.join(', ')}` });
          setVehicleLoading(false);
          return;
        }

        const vehiclesToInsert: VehicleInsert[] = (results.data as any[]).map(row => ({
          plate_number: row.plate_number,
          brand: row.brand,
          model: row.model,
          year: parseInt(row.year, 10),
          capacity: parseInt(row.capacity, 10),
          fuel_type: row.fuel_type,
          status: row.status,
          last_maintenance: row.last_maintenance || new Date().toISOString(),
          next_maintenance: row.next_maintenance || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
        })).filter(vehicle => vehicle.plate_number && vehicle.brand && vehicle.model && !isNaN(vehicle.year) && !isNaN(vehicle.capacity));
        
        if (vehiclesToInsert.length === 0) {
            setVehicleFeedback({ type: 'error', message: 'No se encontraron datos de vehículos válidos en el archivo.' });
            setVehicleLoading(false);
            return;
        }

        const { error } = await supabase.from('vehicles').insert(vehiclesToInsert);

        if (error) {
          setVehicleFeedback({ type: 'error', message: `Error al importar: ${error.message}` });
        } else {
          setVehicleFeedback({ type: 'success', message: `${vehiclesToInsert.length} vehículos importados con éxito.` });
          setVehicleFile(null);
        }
        setVehicleLoading(false);
      },
      error: (error) => {
        setVehicleFeedback({ type: 'error', message: `Error al procesar el archivo: ${error.message}` });
        setVehicleLoading(false);
      }
    });
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Configuración</h1>
        <p className="text-gray-600 dark:text-gray-400">Gestiona la configuración y los datos de la aplicación.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Importar Vehículos desde CSV</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('vehicleFileInput')?.click()}
            >
              <input type="file" id="vehicleFileInput" accept=".csv" onChange={handleFileChange} className="hidden" />
              <UploadCloud size={48} className="mx-auto text-gray-400 mb-4" />
              {vehicleFile ? (
                <div className="flex items-center justify-center space-x-2"><FileText size={20} className="text-green-500" /><span className="text-gray-800 dark:text-gray-200 font-medium">{vehicleFile.name}</span></div>
              ) : (
                <><p className="text-gray-800 dark:text-gray-200 font-medium">Arrastra y suelta tu archivo aquí</p><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">o haz clic para seleccionar</p></>
              )}
            </div>
            <motion.button
              onClick={handleVehicleImport}
              disabled={!vehicleFile || vehicleLoading}
              className="mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2"
            >
              {vehicleLoading ? <><LoaderCircle size={20} className="animate-spin" /><span>Importando...</span></> : <span>Importar Vehículos</span>}
            </motion.button>
            {vehicleFeedback && <div className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${vehicleFeedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}><p className={`text-sm font-medium ${vehicleFeedback.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>{vehicleFeedback.message}</p></div>}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Formato del CSV de Vehículos</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Asegúrate de que tu archivo tenga las siguientes columnas:</p>
            <ul className="space-y-2 text-sm">
              {['plate_number', 'brand', 'model', 'year', 'capacity', 'fuel_type', 'status'].map(col => <li key={col} className="flex items-center"><code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-md text-gray-800 dark:text-gray-200">{col}</code><span className="text-red-500 ml-2">*</span></li>)}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
