export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'driver' | 'passenger';
  avatar: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface Driver extends User {
  role: 'driver';
  licenseNumber: string;
  licenseExpiry: string;
  vehicleId?: string;
  rating: number;
  totalTrips: number;
}

export interface Passenger extends User {
  role: 'passenger';
  department: string;
  employeeId: string;
  qrCode: string;
  homeAddress: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  fuelType: 'Gasolina' | 'Diesel' | 'Eléctrico';
  status: 'active' | 'maintenance' | 'inactive';
  driverId?: string;
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  startPoint: string;
  endPoint: string;
  waypoints: Waypoint[];
  estimatedDuration: number; // in minutes
  distance: number; // in km
  status: 'active' | 'inactive';
}

export interface Waypoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface Trip {
  id: string;
  routeId: string;
  driverId: string;
  vehicleId: string;
  scheduledDeparture: string;
  actualDeparture?: string;
  scheduledArrival: string;
  actualArrival?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  passengers: TripPassenger[];
  notes?: string;
}

export interface TripPassenger {
  passengerId: string;
  waypointId: string;
  boardingTime?: string;
  boardingConfirmed: boolean;
  qrScanned: boolean;
}

export interface QRScanResult {
  passengerId: string;
  tripId: string;
  waypointId: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}
