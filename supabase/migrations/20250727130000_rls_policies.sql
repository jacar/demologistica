/*
# [Seguridad] Políticas de Acceso a Nivel de Fila (RLS)

Este script define las políticas de seguridad para controlar el acceso a los datos.
Sin estas políticas, ninguna información puede ser leída o modificada, incluso por usuarios autenticados.

## Descripción de Políticas:
- **Perfiles (Profiles):**
  - Los usuarios pueden ver su propio perfil.
  - Los usuarios pueden ver los perfiles de todos los conductores y pasajeros (necesario para las listas de la app).
  - Los usuarios solo pueden actualizar su propio perfil.
  - Los administradores tienen acceso completo a todos los perfiles.
- **Tablas Generales (Vehículos, Rutas, Viajes, etc.):**
  - **Lectura (SELECT):** Todos los usuarios autenticados pueden leer todos los datos.
  - **Escritura (INSERT, UPDATE, DELETE):** Solo los usuarios con el rol de 'admin' pueden crear, modificar o eliminar registros.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true (se pueden eliminar las políticas)
*/

-- 1. Políticas para la tabla `profiles`
CREATE POLICY "Allow users to view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to view public roles" ON public.profiles
  FOR SELECT USING (role IN ('driver', 'passenger'));

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Políticas para la tabla `vehicles`
CREATE POLICY "Allow authenticated read access to vehicles" ON public.vehicles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to vehicles" ON public.vehicles
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. Políticas para la tabla `drivers`
CREATE POLICY "Allow authenticated read access to drivers" ON public.drivers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to drivers" ON public.drivers
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 4. Políticas para la tabla `passengers`
CREATE POLICY "Allow authenticated read access to passengers" ON public.passengers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to passengers" ON public.passengers
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. Políticas para la tabla `routes`
CREATE POLICY "Allow authenticated read access to routes" ON public.routes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to routes" ON public.routes
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 6. Políticas para la tabla `waypoints`
CREATE POLICY "Allow authenticated read access to waypoints" ON public.waypoints
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to waypoints" ON public.waypoints
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 7. Políticas para la tabla `trips`
CREATE POLICY "Allow authenticated read access to trips" ON public.trips
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to trips" ON public.trips
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 8. Políticas para la tabla `trip_passengers`
CREATE POLICY "Allow authenticated read access to trip_passengers" ON public.trip_passengers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to trip_passengers" ON public.trip_passengers
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 9. Política de administrador para perfiles (debe ir después de las políticas de usuario para mayor claridad)
CREATE POLICY "Allow admin full access to profiles" ON public.profiles
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
