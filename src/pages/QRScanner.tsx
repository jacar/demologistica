import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, User, MapPin, Clock, CheckCircle, X } from 'lucide-react';
import QRCode from 'qrcode';
import { mockPassengers, mockTrips } from '../data/mockData';

export const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<string>('');
  const [generatedQR, setGeneratedQR] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async (passengerId: string) => {
    if (!passengerId) return;
    
    const passenger = mockPassengers.find(p => p.id === passengerId);
    if (!passenger) return;

    const qrData = {
      passengerId: passenger.id,
      name: passenger.name,
      employeeId: passenger.employeeId,
      department: passenger.department,
      timestamp: new Date().toISOString()
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setGeneratedQR(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const simulateQRScan = () => {
    // Simulate scanning a passenger QR
    const randomPassenger = mockPassengers[Math.floor(Math.random() * mockPassengers.length)];
    const scannedResult = {
      passengerId: randomPassenger.id,
      name: randomPassenger.name,
      employeeId: randomPassenger.employeeId,
      department: randomPassenger.department,
      timestamp: new Date().toISOString(),
      valid: true
    };
    
    setScannedData(scannedResult);
    setIsScanning(false);
  };

  const confirmBoarding = () => {
    // Here you would typically send the data to your backend
    console.log('Passenger boarding confirmed:', scannedData);
    setScannedData(null);
    // Show success message
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Escáner QR</h1>
        <p className="text-gray-600 dark:text-gray-400">Escanea códigos QR de pasajeros para confirmar abordaje</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Scanner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <QrCode className="mr-2" size={24} />
            Escáner de Códigos QR
          </h2>

          <div className="space-y-6">
            {!isScanning && !scannedData && (
              <div className="text-center">
                <div className="w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Presiona el botón para iniciar el escaneo</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsScanning(true)}
                  className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  Iniciar Escaneo
                </motion.button>
              </div>
            )}

            {isScanning && (
              <div className="text-center">
                <div className="w-64 h-64 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border-2 border-blue-300 dark:border-blue-600 relative overflow-hidden">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <QrCode size={48} className="text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Escaneando...</p>
                  </div>
                  
                  {/* Scanning line animation */}
                  <motion.div
                    className="absolute w-full h-1 bg-blue-500"
                    animate={{ y: [-120, 120] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                
                <div className="mt-6 space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={simulateQRScan}
                    className="bg-green-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors"
                  >
                    Simular Escaneo
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsScanning(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </div>
            )}

            {scannedData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 flex items-center">
                    <CheckCircle className="mr-2" size={20} />
                    QR Escaneado Exitosamente
                  </h3>
                  <button
                    onClick={() => setScannedData(null)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="mr-3 text-green-600 dark:text-green-400" size={16} />
                    <span className="font-medium text-green-800 dark:text-green-300">{scannedData.name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-3 text-green-600 dark:text-green-400">ID:</span>
                    <span className="text-green-800 dark:text-green-300">{scannedData.employeeId}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-3 text-green-600 dark:text-green-400">Depto:</span>
                    <span className="text-green-800 dark:text-green-300">{scannedData.department}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="mr-3 text-green-600 dark:text-green-400" size={16} />
                    <span className="text-green-800 dark:text-green-300">
                      {new Date(scannedData.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmBoarding}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Confirmar Abordaje
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setScannedData(null)}
                    className="px-4 py-2 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* QR Generator */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <QrCode className="mr-2" size={24} />
            Generador de Códigos QR
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Pasajero
              </label>
              <select
                value={selectedPassenger}
                onChange={(e) => setSelectedPassenger(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Seleccione un pasajero</option>
                {mockPassengers.map((passenger) => (
                  <option key={passenger.id} value={passenger.id}>
                    {passenger.name} - {passenger.employeeId}
                  </option>
                ))}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => generateQRCode(selectedPassenger)}
              disabled={!selectedPassenger}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generar Código QR
            </motion.button>

            {generatedQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                  <img src={generatedQR} alt="Generated QR Code" className="w-64 h-64" />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Código QR para: {mockPassengers.find(p => p.id === selectedPassenger)?.name}
                  </p>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `qr-${selectedPassenger}.png`;
                      link.href = generatedQR;
                      link.click();
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                  >
                    Descargar QR
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Scans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Escaneos Recientes</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pasajero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockPassengers.slice(0, 5).map((passenger, index) => (
                <tr key={passenger.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full" src={passenger.avatar} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {passenger.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {passenger.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {passenger.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(Date.now() - index * 300000).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Confirmado
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
