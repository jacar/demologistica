/*
# [Initial Schema Setup]
This script establishes the foundational database structure for the TransportApp application. It creates all necessary tables for managing drivers, passengers, vehicles, routes, and trips, and sets up the relationships between them.

## Query Description: [This operation will create the core tables for the application. It is designed to be run on a new or empty database (besides the auth schema). No existing application data will be lost as it does not yet exist. This is a foundational step and is critical for the application to function with real data.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["High"]
- Requires-Backup: [false]
- Reversible: [false]

## Structure Details:
- Creates tables: `vehicles`, `drivers`, `passengers`, `routes`, `waypoints`, `trips`, `trip_passengers`.
- Modifies table: `profiles` to add a `phone` column.
- Establishes foreign key relationships between all related tables.
- Links `drivers` and `passengers` to `auth.users` via the `profiles` table.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [All tables are protected and require users to be authenticated.]

## Performance Impact:
- Indexes: [Primary keys and foreign keys are indexed by default.]
- Triggers: [None]
- Estimated Impact: [Low initial impact. Performance will depend on data volume.]
*/

-- Add phone number to profiles
ALTER TABLE public.profiles
ADD COLUMN phone TEXT;

-- 1. VEHICLES TABLE
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    plate_number TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    "year" INT NOT NULL,
    capacity INT NOT NULL,
    fuel_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, maintenance, inactive
    last_maintenance DATE,
    next_maintenance DATE
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage vehicles" ON public.vehicles FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 2. DRIVERS TABLE
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    license_number TEXT NOT NULL UNIQUE,
    license_expiry DATE NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage drivers" ON public.drivers FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Allow drivers to see their own data" ON public.drivers FOR SELECT TO authenticated USING (auth.uid() = id);

-- 3. PASSENGERS TABLE
CREATE TABLE public.passengers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    department TEXT,
    employee_id TEXT UNIQUE,
    home_address TEXT
);
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read passengers" ON public.passengers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage passengers" ON public.passengers FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Allow passengers to see their own data" ON public.passengers FOR SELECT TO authenticated USING (auth.uid() = id);

-- 4. ROUTES TABLE
CREATE TABLE public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    description TEXT,
    start_point TEXT,
    end_point TEXT,
    estimated_duration_minutes INT,
    distance_km NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'active' -- active, inactive
);
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read routes" ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage routes" ON public.routes FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 5. WAYPOINTS TABLE
CREATE TABLE public.waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    "order" INT NOT NULL
);
ALTER TABLE public.waypoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read waypoints" ON public.waypoints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage waypoints" ON public.waypoints FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 6. TRIPS TABLE
CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    route_id UUID NOT NULL REFERENCES public.routes(id),
    driver_id UUID NOT NULL REFERENCES public.drivers(id),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
    scheduled_departure TIMESTAMPTZ NOT NULL,
    actual_departure TIMESTAMPTZ,
    scheduled_arrival TIMESTAMPTZ NOT NULL,
    actual_arrival TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in-progress, completed, cancelled
    notes TEXT
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read trips" ON public.trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins and assigned drivers to manage trips" ON public.trips FOR ALL TO authenticated USING (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) OR
    (auth.uid() = driver_id)
) WITH CHECK (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) OR
    (auth.uid() = driver_id)
);

-- 7. TRIP_PASSENGERS (JOIN TABLE)
CREATE TABLE public.trip_passengers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES public.passengers(id) ON DELETE CASCADE,
    waypoint_id UUID NOT NULL REFERENCES public.waypoints(id),
    boarding_time TIMESTAMPTZ,
    boarding_confirmed BOOLEAN DEFAULT false,
    qr_scanned BOOLEAN DEFAULT false,
    UNIQUE(trip_id, passenger_id)
);
ALTER TABLE public.trip_passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read trip passenger data" ON public.trip_passengers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins, drivers, and the passenger themselves to manage" ON public.trip_passengers FOR ALL TO authenticated USING (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) OR
    (auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = trip_id)) OR
    (auth.uid() = passenger_id)
) WITH CHECK (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) OR
    (auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = trip_id)) OR
    (auth.uid() = passenger_id)
);
