export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      drivers: {
        Row: {
          created_at: string
          id: string
          license_expiry: string
          license_number: string
          rating: number | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          license_expiry: string
          license_number: string
          rating?: number | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          license_expiry?: string
          license_number?: string
          rating?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      passengers: {
        Row: {
          created_at: string
          department: string | null
          employee_id: string | null
          home_address: string | null
          id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          home_address?: string | null
          id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          home_address?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "passengers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string
          description: string | null
          distance_km: number | null
          end_point: string | null
          estimated_duration_minutes: number | null
          id: string
          name: string
          start_point: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          distance_km?: number | null
          end_point?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name: string
          start_point?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          distance_km?: number | null
          end_point?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name?: string
          start_point?: string | null
          status?: string
        }
        Relationships: []
      }
      trip_passengers: {
        Row: {
          boarding_confirmed: boolean | null
          boarding_time: string | null
          id: number
          passenger_id: string
          qr_scanned: boolean | null
          trip_id: string
          waypoint_id: string
        }
        Insert: {
          boarding_confirmed?: boolean | null
          boarding_time?: string | null
          id?: number
          passenger_id: string
          qr_scanned?: boolean | null
          trip_id: string
          waypoint_id: string
        }
        Update: {
          boarding_confirmed?: boolean | null
          boarding_time?: string | null
          id?: number
          passenger_id?: string
          qr_scanned?: boolean | null
          trip_id?: string
          waypoint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_passengers_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_passengers_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_passengers_waypoint_id_fkey"
            columns: ["waypoint_id"]
            isOneToOne: false
            referencedRelation: "waypoints"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          created_at: string
          driver_id: string
          id: string
          notes: string | null
          route_id: string
          scheduled_arrival: string
          scheduled_departure: string
          status: string
          vehicle_id: string
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          created_at?: string
          driver_id: string
          id?: string
          notes?: string | null
          route_id: string
          scheduled_arrival: string
          scheduled_departure: string
          status?: string
          vehicle_id: string
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          notes?: string | null
          route_id?: string
          scheduled_arrival?: string
          scheduled_departure?: string
          status?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          capacity: number
          created_at: string
          fuel_type: string
          id: string
          last_maintenance: string | null
          model: string
          next_maintenance: string | null
          plate_number: string
          status: string
          year: number
        }
        Insert: {
          brand: string
          capacity: number
          created_at?: string
          fuel_type: string
          id?: string
          last_maintenance?: string | null
          model: string
          next_maintenance?: string | null
          plate_number: string
          status?: string
          year: number
        }
        Update: {
          brand?: string
          capacity?: number
          created_at?: string
          fuel_type?: string
          id?: string
          last_maintenance?: string | null
          model?: string
          next_maintenance?: string | null
          plate_number?: string
          status?: string
          year?: number
        }
        Relationships: []
      }
      waypoints: {
        Row: {
          address: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          order: number
          route_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          order: number
          route_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          order?: number
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waypoints_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
