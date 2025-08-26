import { fakerES as faker } from '@faker-js/faker';
import { Driver, Passenger, Vehicle, Route, Trip } from '../types';

// Generate Drivers
export const mockDrivers: Driver[] = Array.from({ length: 10 }, (_, i) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: 'driver',
  avatar: `https://i.pravatar.cc/150?u=driver${i}`,
  phone: faker.phone.number(),
  status: faker.helpers.arrayElement(['active', 'inactive']),
  licenseNumber: faker.string.alphanumeric(8).toUpperCase(),
  licenseExpiry: faker.date.future(2).toISOString(),
  rating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
  totalTrips: faker.number.int({ min: 20, max: 200 }),
}));

// Generate Passengers
export const mockPassengers: Passenger[] = Array.from({ length: 50 }, (_, i) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: 'passenger',
  avatar: `https://i.pravatar.cc/150?u=passenger${i}`,
  phone: faker.phone.number(),
  status: faker.helpers.arrayElement(['active', 'inactive']),
  department: faker.commerce.department(),
  employeeId: faker.string.alphanumeric(6).toUpperCase(),
  qrCode: faker.string.uuid(),
  homeAddress: faker.location.streetAddress(),
}));

// Generate Vehicles
export const mockVehicles: Vehicle[] = Array.from({ length: 15 }, (_, i) => {
  const lastMaintenance = faker.date.past(1);
  return {
    id: faker.string.uuid(),
    plateNumber: `${faker.string.alpha({ count: 3, casing: 'upper' })}-${faker.number.int({ min: 100, max: 999 })}`,
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    year: faker.number.int({ min: 2018, max: 2025 }),
    capacity: faker.helpers.arrayElement([12, 16, 24, 40]),
    fuelType: faker.helpers.arrayElement(['Gasolina', 'Diesel', 'Eléctrico']),
    status: faker.helpers.arrayElement(['active', 'maintenance', 'inactive']),
    driverId: i < mockDrivers.length ? (faker.datatype.boolean() ? mockDrivers[i].id : undefined) : undefined,
    lastMaintenance: lastMaintenance.toISOString(),
    nextMaintenance: faker.date.future(1, lastMaintenance).toISOString(),
  };
});

// Generate Routes
export const mockRoutes: Route[] = Array.from({ length: 5 }, () => ({
  id: faker.string.uuid(),
  name: `Ruta ${faker.location.city()}`,
  description: faker.lorem.sentence(),
  startPoint: 'Oficina Principal',
  endPoint: faker.location.city(),
  waypoints: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, (_, i) => ({
    id: faker.string.uuid(),
    name: `Parada ${faker.location.street()}`,
    address: faker.location.streetAddress(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    order: i + 1,
  })),
  estimatedDuration: faker.number.int({ min: 30, max: 90 }),
  distance: faker.number.int({ min: 15, max: 50 }),
  status: 'active',
}));

// Generate Trips
export const mockTrips: Trip[] = Array.from({ length: 25 }, () => {
  const route = faker.helpers.arrayElement(mockRoutes);
  const driver = faker.helpers.arrayElement(mockDrivers);
  const vehicle = faker.helpers.arrayElement(mockVehicles.filter(v => v.status === 'active'));
  const status = faker.helpers.arrayElement(['scheduled', 'in-progress', 'completed', 'cancelled']);
  
  return {
    id: faker.string.uuid(),
    routeId: route.id,
    driverId: driver.id,
    vehicleId: vehicle.id,
    scheduledDeparture: faker.date.recent().toISOString(),
    scheduledArrival: faker.date.future().toISOString(),
    status,
    passengers: faker.helpers.arrayElements(mockPassengers, faker.number.int({ min: 5, max: vehicle.capacity })).map(p => ({
      passengerId: p.id,
      waypointId: faker.helpers.arrayElement(route.waypoints).id,
      boardingTime: status !== 'scheduled' ? faker.date.recent().toISOString() : undefined,
      boardingConfirmed: status !== 'scheduled' ? faker.datatype.boolean() : false,
      qrScanned: status !== 'scheduled' ? faker.datatype.boolean() : false,
    })),
  };
});
