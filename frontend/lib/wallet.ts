import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchUserPoaps, findMatchingUsers, type POAP, type UserProfile } from './utils';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect } from 'react';

interface WalletState {
  userPoaps: POAP[];
  matchingUsers: UserProfile[];
  setUserPoaps: (poaps: POAP[]) => void;
  setMatchingUsers: (users: UserProfile[]) => void;
  fetchPoapsAndMatches: (address: string) => Promise<void>;
}

// RainbowKit/wagmi compatible wallet store
export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      userPoaps: [],
      matchingUsers: [],
      
      setUserPoaps: (poaps) => set({ userPoaps: poaps }),
      setMatchingUsers: (users) => set({ matchingUsers: users }),
      
      fetchPoapsAndMatches: async (address: string) => {
        if (!address) return;
        
        try {
          // Fetch the user's POAPs
          const poaps = await fetchUserPoaps(address);
          set({ userPoaps: poaps });
          
          // Find users with matching POAPs
          const matchedUsers = findMatchingUsers(poaps);
          set({ matchingUsers: matchedUsers });
        } catch (error) {
          console.error('Error fetching POAPs and matches:', error);
        }
      }
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ userPoaps: state.userPoaps }),
    }
  )
);

// Hook for connecting wallet functionality
export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const { fetchPoapsAndMatches, userPoaps, matchingUsers } = useWalletStore();
  
  // Fetch POAPs and matches when address changes
  const loadUserData = async () => {
    if (address) {
      // In a real app, this would be a proper API call 
      // to fetch the user's POAPs from the blockchain
      console.log('Loading POAPs for address:', address);
      await fetchPoapsAndMatches(address);
    }
  };
  
  // Auto-load data when address changes
  useEffect(() => {
    if (isConnected && address) {
      console.log('Address connected, loading user data');
      loadUserData();
    }
  }, [address, isConnected]);
  
  return {
    address,
    isConnected,
    isLoading,
    userPoaps,
    matchingUsers,
    connectors,
    pendingConnector,
    connect,
    disconnect,
    loadUserData,
  };
}