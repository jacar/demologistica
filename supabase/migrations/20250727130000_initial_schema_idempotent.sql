/*
          # [Initial Schema Creation (Idempotent)]
          Creates the initial database schema for the TransportApp. This version is idempotent, meaning it can be run multiple times without causing errors. It will only create tables and objects that do not already exist.

          ## Query Description: [This script sets up all necessary tables like profiles, vehicles, routes, trips, etc. It checks for the existence of tables before creating them to prevent errors on re-runs. It also configures relationships and row-level security.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Tables Created: profiles, vehicles, routes, waypoints, drivers, passengers, trips, trip_passengers.
          - Foreign Keys: Establishes relationships between tables.
          - Policies: Sets up initial Row Level Security policies.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Supabase Auth]
          
          ## Performance Impact:
          - Indexes: [Primary keys and foreign keys are indexed by default]
          - Triggers: [None]
          - Estimated Impact: [Low, as it's an initial setup.]
*/

-- 1. Profiles Table (linked to auth.users)
-- This table is often created by Supabase automatically. We use IF NOT EXISTS to be safe.
create table if not exists public.profiles (
  id uuid not null primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  username text,
  role text,
  phone text,
  updated_at timestamp with time zone
);
comment on table public.profiles is 'Profile data for each user.';
comment on column public.profiles.id is 'References the internal Supabase auth user.';

-- 2. Enable Row Level Security for profiles
alter table public.profiles enable row level security;

-- 3. Policies for Profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);


-- 4. Vehicles Table
create table if not exists public.vehicles (
  id uuid not null primary key default gen_random_uuid(),
  plate_number text not null unique,
  brand text not null,
  model text not null,
  year int not null,
  capacity int not null,
  fuel_type text not null,
  status text not null default 'active',
  last_maintenance timestamp with time zone,
  next_maintenance timestamp with time zone,
  created_at timestamp with time zone not null default now()
);
comment on table public.vehicles is 'Stores information about the transport vehicles.';
alter table public.vehicles enable row level security;
drop policy if exists "Enable read access for authenticated users" on public.vehicles;
create policy "Enable read access for authenticated users" on public.vehicles for select to authenticated using (true);


-- 5. Routes Table
create table if not exists public.routes (
  id uuid not null primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_point text,
  end_point text,
  estimated_duration_minutes int,
  distance_km int,
  status text not null default 'active',
  created_at timestamp with time zone not null default now()
);
comment on table public.routes is 'Defines the transport routes.';
alter table public.routes enable row level security;
drop policy if exists "Enable read access for authenticated users" on public.routes;
create policy "Enable read access for authenticated users" on public.routes for select to authenticated using (true);


-- 6. Waypoints Table
create table if not exists public.waypoints (
  id uuid not null primary key default gen_random_uuid(),
  route_id uuid not null references public.routes on delete cascade,
  name text not null,
  address text,
  latitude float,
  longitude float,
  "order" int not null,
  created_at timestamp with time zone not null default now()
);
comment on table public.waypoints is 'Defines the stops within a route.';
alter table public.waypoints enable row level security;
drop policy if exists "Enable read access for authenticated users" on public.waypoints;
create policy "Enable read access for authenticated users" on public.waypoints for select to authenticated using (true);


-- 7. Drivers Table
create table if not exists public.drivers (
  id uuid not null primary key references public.profiles on delete cascade,
  license_number text not null,
  license_expiry date not null,
  rating numeric(2,1),
  vehicle_id uuid references public.vehicles on delete set null,
  created_at timestamp with time zone not null default now()
);
comment on table public.drivers is 'Stores driver-specific information, linked to a profile.';
alter table public.drivers enable row level security;
drop policy if exists "Enable read access for authenticated users" on public.drivers;
create policy "Enable read access for authenticated users" on public.drivers for select to authenticated using (true);


-- 8. Passengers Table
create table if not exists public.passengers (
  id uuid not null primary key references public.profiles on delete cascade,
  employee_id text,
  department text,
  home_address text,
  created_at timestamp with time zone not null default now()
);
comment on table public.passengers is 'Stores passenger-specific information, linked to a profile.';
alter table public.passengers enable row level security;
drop policy if exists "Enable read access for authenticated users" on public.passengers;
create policy "Enable read access for authenticated users" on public.passengers for select to authenticated using (true);


-- 9. Trips Table
create table if not exists public.trips (
  id uuid not null primary key default gen_random_uuid(),
  route_id uuid not null references public.routes on delete restrict,
  driver_id uuid not null references public.drivers on delete restrict,
  vehicle_id uuid not null references public.vehicles on delete restrict,
  scheduled_departure timestamp with time zone not null,
  scheduled_arrival timestamp with time zone not null,
  actual_departure timestamp with time zone,
  actual_arrival timestamp with time zone,
  status text not null default 'scheduled',
  notes text,
  created_at timestamp with time zone not null default now()
);
comment on table public.trips is 'Represents a single journey.';
alter table public.trips enable row level security;
drop policy if exists "Enable read access for authenticated users" on public.trips;
create policy "Enable read access for authenticated users" on public.trips for select to authenticated using (true);


-- 10. Trip Passengers Table (Junction Table)
create table if not exists public.trip_passengers (
  id bigint generated by default as identity primary key,
  trip_id uuid not null references public.trips on delete cascade,
  passenger_id uuid not null references public.passengers on delete cascade,
  waypoint_id uuid not null references public.waypoints on delete restrict,
  boarding_time timestamp with time zone,
  boarding_confirmed boolean default false,
  qr_scanned boolean default false
);
comment on table public.trip_passengers is 'Links passengers to specific trips.';
alter table public.trip_passengers enable row level security;
drop policy if exists "Enable read access for authenticated users" on public.trip_passengers;
create policy "Enable read access for authenticated users" on public.trip_passengers for select to authenticated using (true);
