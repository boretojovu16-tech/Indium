import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface Profile {
  id: string;
  full_name: string;
  balance: number;
  withdrawable_balance: number;
  reward_balance: number;
  referrer_id: string | null;
  referral_code?: string;
  last_daily_claim_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateBalanceMock: (amount: number, type?: string) => Promise<void>;
  updateWithdrawableBalance: (amount: number, type?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  updateBalanceMock: () => {},
  updateWithdrawableBalance: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback for mock user if supabase is not fully configured
  const isMockMode = import.meta.env.VITE_SUPABASE_URL === undefined;

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMockMode) {
      // Mock Data if no supabase connection
      setProfile({
        id: 'mock-id',
        full_name: 'Test User',
        balance: 1428950.42,
        withdrawable_balance: 50000,
        reward_balance: 0,
        referrer_id: null,
        referral_code: 'WEALTH-MOCK',
      });
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isMockMode]);

  // Realtime subscription for profile changes
  useEffect(() => {
    if (!user || isMockMode) return;

    const profileSubscription = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [user, isMockMode]);

  const refreshProfile = async () => {
    if (user && !isMockMode) {
      await fetchProfile(user.id);
    }
  };

  const updateBalance = async (amount: number, type?: string) => {
    if (isMockMode && profile) {
      setProfile({ ...profile, balance: profile.balance + amount });
    } else if (user && profile) {
      // Optimistic UI update
      setProfile({ ...profile, balance: Number(profile.balance) + amount });
      
      // Database update
      const { error } = await supabase
        .from('profiles')
        .update({ balance: Number(profile.balance) + amount })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating balance:', error);
        // Revert on error
        await fetchProfile(user.id);
      } else {
        // Log transaction
        await supabase.from('transactions').insert([{
          user_id: user.id,
          type: type || (amount > 0 ? 'Deposit' : 'Withdrawal'),
          amount: Math.abs(amount),
          status: 'Completed'
        }]);
      }
    }
  }

  const updateWithdrawableBalance = async (amount: number, type?: string) => {
    if (isMockMode && profile) {
      setProfile({ ...profile, withdrawable_balance: profile.withdrawable_balance + amount });
    } else if (user && profile) {
      setProfile({ ...profile, withdrawable_balance: Number(profile.withdrawable_balance) + amount });
      
      const { error } = await supabase
        .from('profiles')
        .update({ withdrawable_balance: Number(profile.withdrawable_balance) + amount })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating withdrawable balance:', error);
        await fetchProfile(user.id);
      } else {
        // Log transaction
        await supabase.from('transactions').insert([{
          user_id: user.id,
          type: type || (amount > 0 ? 'Earned' : 'Withdrawal'),
          amount: Math.abs(amount),
          status: 'Completed'
        }]);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      refreshProfile, 
      updateBalanceMock: updateBalance,
      updateWithdrawableBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
