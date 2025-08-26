/*
# [INITIAL SCHEMA V2 - CORRECTED ORDER]
This script creates the complete initial database schema for the TransportApp.
It establishes all necessary tables, relationships, and security policies.
The creation order has been corrected to respect table dependencies.

## Query Description: This operation is structural and safe to run on a new project. It will create all the necessary tables for the application to function. It does not delete any data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: false (requires manual deletion of tables)

## Structure Details:
- Creates tables: profiles, vehicles, drivers, passengers, routes, waypoints, trips, trip_passengers.
- Establishes foreign key relationships between tables.
- Sets up Row Level Security (RLS) for all tables.

## Security Implications:
- RLS Status: Enabled on all tables.
- Policy Changes: Creates initial SELECT, INSERT, UPDATE, DELETE policies.
- Auth Requirements: Policies are tied to authenticated user roles.
*/

-- 1. PROFILES TABLE
-- Stores public user data, linked to auth.users. Must be created first.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamptz,
    full_name text,
    avatar_url text,
    phone text,
    role text NOT NULL DEFAULT 'passenger'::text
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. VEHICLES TABLE
-- Independent table.
CREATE TABLE public.vehicles (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number text NOT NULL UNIQUE,
    brand text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL,
    capacity integer NOT NULL,
    fuel_type text NOT NULL,
    status text NOT NULL DEFAULT 'active'::text,
    last_maintenance timestamptz,
    next_maintenance timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read vehicles." ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage vehicles." ON public.vehicles FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text );

-- 3. DRIVERS TABLE
-- Depends on profiles and vehicles.
CREATE TABLE public.drivers (
    id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number text NOT NULL UNIQUE,
    license_expiry date NOT NULL,
    rating numeric(2, 1),
    vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read drivers." ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage drivers." ON public.drivers FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text );

-- 4. PASSENGERS TABLE
-- Depends on profiles.
CREATE TABLE public.passengers (
    id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id text UNIQUE,
    department text,
    home_address text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read passengers." ON public.passengers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage passengers." ON public.passengers FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text );

-- 5. ROUTES TABLE
-- Independent table.
CREATE TABLE public.routes (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    start_point text,
    end_point text,
    estimated_duration_minutes integer,
    distance_km numeric,
    status text NOT NULL DEFAULT 'active'::text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read routes." ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage routes." ON public.routes FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text );

-- 6. WAYPOINTS TABLE
-- Depends on routes.
CREATE TABLE public.waypoints (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    name text NOT NULL,
    address text,
    latitude numeric,
    longitude numeric,
    "order" integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.waypoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read waypoints." ON public.waypoints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage waypoints." ON public.waypoints FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text );

-- 7. TRIPS TABLE
-- Depends on routes, drivers, vehicles.
CREATE TABLE public.trips (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id uuid NOT NULL REFERENCES public.routes(id),
    driver_id uuid NOT NULL REFERENCES public.drivers(id),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id),
    scheduled_departure timestamptz NOT NULL,
    scheduled_arrival timestamptz NOT NULL,
    actual_departure timestamptz,
    actual_arrival timestamptz,
    status text NOT NULL DEFAULT 'scheduled'::text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read trips." ON public.trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins or assigned drivers to manage trips." ON public.trips FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text OR auth.uid() = driver_id );

-- 8. TRIP_PASSENGERS TABLE
-- Depends on trips, passengers, waypoints.
CREATE TABLE public.trip_passengers (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    passenger_id uuid NOT NULL REFERENCES public.passengers(id) ON DELETE CASCADE,
    waypoint_id uuid NOT NULL REFERENCES public.waypoints(id) ON DELETE CASCADE,
    boarding_time timestamptz,
    boarding_confirmed boolean DEFAULT false,
    qr_scanned boolean DEFAULT false
);
ALTER TABLE public.trip_passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow related users to read trip passenger data." ON public.trip_passengers FOR SELECT TO authenticated USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text OR auth.uid() = passenger_id OR auth.uid() = (SELECT driver_id FROM trips WHERE id = trip_id) );
CREATE POLICY "Allow admins or drivers to manage trip passengers." ON public.trip_passengers FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text OR auth.uid() = (SELECT driver_id FROM trips WHERE id = trip_id) );
