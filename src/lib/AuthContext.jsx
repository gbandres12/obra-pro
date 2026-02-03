
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [userSubscription, setUserSubscription] = useState({ plano: 'free', status: 'inactive', role: 'user' });
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchUserSubscription(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await fetchUserSubscription(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserSubscription({ plano: 'free', status: 'inactive' });
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserSubscription = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist yet (PGRST116), or other error, fallback to free
        console.log('Subscription fetch note:', error.message);
        setUserSubscription({ plano: 'free', status: 'inactive' });
      } else if (data) {
        setUserSubscription({
          plano: data.plan_tier || 'free',
          status: data.subscription_status || 'inactive',
          role: data.role || 'user'
        });
        // Check if user is master (admin)
        if (data.role === 'admin' || data.role === 'master' || data.plan_tier === 'enterprise') {
          setIsMaster(true);
        }
      }
    } catch (err) {
      console.error('Error in fetchUserSubscription:', err);
      setUserSubscription({ plano: 'free', status: 'inactive' });
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false, // Default to false as we don't have this logic yet
      login,
      logout,
      isMaster,
      navigateToLogin: () => window.location.href = '/Login' // Match the key in PAGES
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
