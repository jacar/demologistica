import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, QrCode, Mail, Phone, Building, Upload, LoaderCircle, AlertTriangle, FileText, ShieldAlert, CheckCircle, UserPlus, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Modal } from '../components/common/Modal';
import Papa from 'papaparse';

// This type now reflects the nested structure from the corrected query
type PassengerProfile = {
  id: string;
  department: string | null;
  employee_id: string | null;
  home_address: string | null;
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  status: 'active' | 'inactive'; // Placeholder status
};

const initialNewPassengerState = {
  email: '',
  password: '',
  full_name: '',
  phone: '',
  department: '',
  employee_id: '',
  home_address: '',
};

export const Passengers: React.FC = () => {
  const [passengers, setPassengers] = useState<PassengerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // State for Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State for CSV Import
  const [passengerFile, setPassengerFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string; details?: string[] } | null>(null);

  // State for Single Passenger Add
  const [newPassenger, setNewPassenger] = useState(initialNewPassengerState);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);


  const fetchPassengers = async () => {
    setLoading(true);
    setError(null);
    
    // Corrected and more robust query
    const { data, error: fetchError } = await supabase
      .from('passengers')
      .select(`
        *,
        profiles:profiles (
          id,
          full_name,
          email,
          phone,
          avatar_url
        )
      `);

    if (fetchError) {
      console.error('Error fetching passengers:', fetchError);
      setError('No se pudieron cargar los pasajeros. Por favor, inténtelo de nuevo.');
    } else {
      const formattedPassengers = data.map(p => ({
        ...p,
        status: 'active' as const // Placeholder status
      }));
      setPassengers(formattedPassengers || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPassengers();
  }, []);
  
  const departments = useMemo(() => ['all', ...Array.from(new Set(passengers.map(p => p.department).filter(Boolean))) as string[]], [passengers]);

  const filteredPassengers = useMemo(() => {
    return passengers.filter(passenger => {
      const name = passenger.profiles?.full_name || '';
      const employeeId = passenger.employee_id || '';
      const department = passenger.department || '';

      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [passengers, searchTerm, departmentFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'inactive': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPassengerFile(e.target.files[0]);
      setImportFeedback(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPassengerFile(e.dataTransfer.files[0]);
      setImportFeedback(null);
    }
  };

  const handlePassengerImport = async () => {
    if (!passengerFile) {
        setImportFeedback({ type: 'error', message: 'Por favor, selecciona un archivo primero.' });
        return;
    }

    setImportLoading(true);
    setImportFeedback(null);

    Papa.parse(passengerFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const requiredColumns = ['email', 'password', 'full_name', 'phone', 'department', 'employee_id', 'home_address'];
            const headers = results.meta.fields || [];
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));

            if (missingColumns.length > 0) {
                setImportFeedback({ type: 'error', message: `Faltan las siguientes columnas en el CSV: ${missingColumns.join(', ')}` });
                setImportLoading(false);
                return;
            }

            const rows = results.data as any[];
            let successCount = 0;
            const errorDetails: string[] = [];

            for (const [index, row] of rows.entries()) {
                if (!row.email || !row.password || !row.full_name) {
                    errorDetails.push(`Fila ${index + 2}: Faltan email, password o full_name.`);
                    continue;
                }

                try {
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                        email: row.email,
                        password: row.password,
                        options: {
                            data: {
                                full_name: row.full_name,
                                phone: row.phone,
                                role: 'passenger',
                                avatar_url: `https://i.pravatar.cc/150?u=${row.email}`
                            }
                        }
                    });

                    if (authError) throw new Error(authError.message);
                    if (!authData.user) throw new Error('No se pudo crear el usuario en el sistema de autenticación.');

                    const { error: passengerError } = await supabase
                        .from('passengers')
                        .insert({
                            id: authData.user.id,
                            department: row.department,
                            employee_id: row.employee_id,
                            home_address: row.home_address,
                        });

                    if (passengerError) throw new Error(`Usuario creado, pero perfil de pasajero falló: ${passengerError.message}`);
                    
                    successCount++;
                } catch (e: any) {
                    errorDetails.push(`Fila ${index + 2} (${row.email}): ${e.message}`);
                }
            }

            let message = '';
            let type: 'success' | 'error' = 'success';

            if (successCount > 0) message += `${successCount} pasajeros importados con éxito. `;
            if (errorDetails.length > 0) {
                message += `${errorDetails.length} filas fallaron.`;
                type = 'error';
            }
            if (successCount === 0 && errorDetails.length === 0 && rows.length > 0) {
                message = 'El archivo no contenía filas con datos válidos para procesar.';
                type = 'error';
            }
            if (rows.length === 0) {
                message = 'El archivo CSV estaba vacío.';
                type = 'error';
            }

            setImportFeedback({ type, message, details: errorDetails });
            setImportLoading(false);
            if (type === 'success' && errorDetails.length === 0) {
                setPassengerFile(null);
                setTimeout(() => {
                    setIsImportModalOpen(false);
                    fetchPassengers();
                }, 1500);
            } else if (successCount > 0) {
                fetchPassengers();
            }
        },
        error: (error) => {
            setImportFeedback({ type: 'error', message: `Error al procesar el archivo: ${error.message}` });
            setImportLoading(false);
        }
    });
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPassenger(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      // Step 1: Create the user in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newPassenger.email,
        password: newPassenger.password,
        options: {
          data: {
            full_name: newPassenger.full_name,
            phone: newPassenger.phone,
            role: 'passenger',
            avatar_url: `https://i.pravatar.cc/150?u=${newPassenger.email}`
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario.');

      // Step 2: Create the passenger profile in the 'passengers' table
      const { error: passengerError } = await supabase
        .from('passengers')
        .insert({
          id: authData.user.id,
          department: newPassenger.department,
          employee_id: newPassenger.employee_id,
          home_address: newPassenger.home_address,
        });
      
      if (passengerError) {
        // Optional: Attempt to delete the auth user if the profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw passengerError;
      }

      // Success
      setAddLoading(false);
      setIsAddModalOpen(false);
      setNewPassenger(initialNewPassengerState);
      fetchPassengers();

    } catch (e: any) {
      setAddError(e.message || 'Ocurrió un error desconocido.');
      setAddLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pasajeros</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona la información de los empleados que usan el transporte</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsImportModalOpen(true)}
              className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>Importar CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Nuevo Pasajero</span>
            </motion.button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar pasajeros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'Todos los Departamentos' : dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Total: {filteredPassengers.length} pasajeros</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><LoaderCircle size={48} className="animate-spin text-green-500" /></div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-2xl"><ShieldAlert size={48} className="mx-auto text-red-500 mb-4" /><h3 className="text-xl font-semibold text-red-800 dark:text-red-300">Error al cargar datos</h3><p className="text-red-600 dark:text-red-400 mt-2">{error}</p></div>
        ) : filteredPassengers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPassengers.map((passenger, index) => (
              <motion.div
                key={passenger.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={passenger.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${passenger.id}`} alt={passenger.profiles?.full_name || ''} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{passenger.profiles?.full_name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{passenger.employee_id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(passenger.status)}`}>{passenger.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Mail size={14} className="mr-2" /><span>{passenger.profiles?.email}</span></div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Phone size={14} className="mr-2" /><span>{passenger.profiles?.phone || 'N/A'}</span></div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Building size={14} className="mr-2" /><span>{passenger.department || 'N/A'}</span></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={passenger.home_address || ''}>
                    Dirección: {passenger.home_address || 'N/A'}
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors" title="Ver código QR"><QrCode size={16} /></motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No se encontraron pasajeros</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Intenta ajustar los filtros o añade un nuevo pasajero.</p>
          </motion.div>
        )}
      </div>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Pasajeros desde CSV" size="3xl">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 dark:hover:border-green-400 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('passengerFileInputModal')?.click()}
              >
                <input type="file" id="passengerFileInputModal" accept=".csv" onChange={handleFileChange} className="hidden" />
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                {passengerFile ? (
                  <div className="flex items-center justify-center space-x-2"><FileText size={20} className="text-green-500" /><span className="text-gray-800 dark:text-gray-200 font-medium">{passengerFile.name}</span></div>
                ) : (
                  <><p className="text-gray-800 dark:text-gray-200 font-medium">Arrastra y suelta tu archivo aquí</p><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">o haz clic para seleccionar</p></>
                )}
              </div>
              <motion.button
                onClick={handlePassengerImport}
                disabled={!passengerFile || importLoading}
                className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importLoading ? <><LoaderCircle size={20} className="animate-spin" /><span>Importando...</span></> : <span>Importar Pasajeros</span>}
              </motion.button>
              {importFeedback && (
                  <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 rounded-lg ${importFeedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}
                  >
                      <div className="flex items-start space-x-3">
                          {importFeedback.type === 'success' ? <CheckCircle className="text-green-500 flex-shrink-0 mt-1" /> : <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" />}
                          <div>
                              <p className={`text-sm font-medium ${importFeedback.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>{importFeedback.message}</p>
                              {importFeedback.details && importFeedback.details.length > 0 && (
                                  <ul className="mt-2 text-xs list-disc list-inside text-red-700 dark:text-red-400 space-y-1 max-h-32 overflow-y-auto">
                                      {importFeedback.details.map((detail, i) => <li key={i}>{detail}</li>)}
                                  </ul>
                              )}
                          </div>
                      </div>
                  </motion.div>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Formato del CSV de Pasajeros</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">El CSV debe tener las siguientes columnas:</p>
              <ul className="space-y-2 text-sm">
                {['email', 'password', 'full_name', 'phone', 'department', 'employee_id', 'home_address'].map(col => <li key={col} className="flex items-center"><code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-md text-gray-800 dark:text-gray-200">{col}</code><span className="text-red-500 ml-2">*</span></li>)}
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4"><span className="text-red-500">*</span> Campos requeridos.</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Añadir Nuevo Pasajero">
        <form onSubmit={handleCreatePassenger} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
              <input type="text" name="full_name" value={newPassenger.full_name} onChange={handleAddInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo Electrónico</label>
              <input type="email" name="email" value={newPassenger.email} onChange={handleAddInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
              <input type="password" name="password" value={newPassenger.password} onChange={handleAddInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
              <input type="tel" name="phone" value={newPassenger.phone} onChange={handleAddInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Departamento</label>
              <input type="text" name="department" value={newPassenger.department} onChange={handleAddInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID de Empleado</label>
              <input type="text" name="employee_id" value={newPassenger.employee_id} onChange={handleAddInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dirección</label>
              <input type="text" name="home_address" value={newPassenger.home_address} onChange={handleAddInputChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" />
            </div>
          </div>
          {addError && (
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-center">
              <p className="text-sm text-red-700 dark:text-red-300">{addError}</p>
            </div>
          )}
          <div className="flex justify-end space-x-4 pt-4">
            <motion.button type="button" onClick={() => setIsAddModalOpen(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium">Cancelar</motion.button>
            <motion.button type="submit" disabled={addLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center disabled:opacity-50">
              {addLoading ? <LoaderCircle size={20} className="animate-spin" /> : 'Crear Pasajero'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </>
  );
};
