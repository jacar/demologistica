import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // For now, we'll create a mock user object from the session.
        // In a real app, you'd fetch a "profiles" table.
        const userProfile: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email || 'Usuario',
          email: session.user.email || '',
          role: (session.user.user_metadata.role as User['role']) || 'passenger',
          avatar: session.user.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${session.user.id}`,
          phone: session.user.phone || '',
          status: 'active',
        };
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Initial check
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
         const userProfile: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email || 'Usuario',
          email: session.user.email || '',
          role: (session.user.user_metadata.role as User['role']) || 'passenger',
          avatar: session.user.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${session.user.id}`,
          phone: session.user.phone || '',
          status: 'active',
        };
        setUser(userProfile);
      }
      setLoading(false);
    };

    checkInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
