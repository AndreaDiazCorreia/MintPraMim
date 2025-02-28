import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type POAP, type UserProfile } from './utils';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect } from 'react';
// All poap functions are now async
import { 
  fetchUserPoapsFromBlockchain, 
  findMatchingUsersFromPoaps, 
  getPoapHolders 
} from './poap';

interface WalletState {
  userPoaps: POAP[];
  matchingUsers: UserProfile[];
  poapHolders: Record<string, string[]>; // Map of POAP ID to holder addresses
  setUserPoaps: (poaps: POAP[]) => void;
  setMatchingUsers: (users: UserProfile[]) => void;
  setPoapHolders: (poapId: string, holders: string[]) => void;
  fetchPoapsAndMatches: (address: string) => Promise<void>;
  fetchPoapHolders: (poapId: string) => Promise<void>;
}

// RainbowKit/wagmi compatible wallet store
export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      userPoaps: [],
      matchingUsers: [],
      poapHolders: {},
      
      setUserPoaps: (poaps) => set({ userPoaps: poaps }),
      setMatchingUsers: (users) => set({ matchingUsers: users }),
      setPoapHolders: (poapId, holders) => set(state => ({ 
        poapHolders: { ...state.poapHolders, [poapId]: holders } 
      })),
      
      fetchPoapsAndMatches: async (address: string) => {
        if (!address) return;
        
        try {
          // Fetch the user's POAPs from blockchain
          const poaps = await fetchUserPoapsFromBlockchain(address as `0x${string}`);
          set({ userPoaps: poaps });
          
          // Find users with matching POAPs
          const matchedUsers = await findMatchingUsersFromPoaps(poaps);
          set({ matchingUsers: matchedUsers });
          
          // Start fetching holders for each POAP in the background
          for (const poap of poaps) {
            await get().fetchPoapHolders(poap.id);
          }
          
        } catch (error) {
          console.error('Error fetching POAPs and matches:', error);
        }
      },
      
      fetchPoapHolders: async (poapId: string) => {
        if (!poapId) return;
        
        try {
          // Get holders for a specific POAP
          const holders = await getPoapHolders(poapId);
          // Map addresses to strings with safe conversion
          const holderStrings = holders.map(addr => 
            typeof addr === 'string' ? addr : addr.toString()
          );
          get().setPoapHolders(poapId, holderStrings);
        } catch (error) {
          console.error(`Error fetching holders for POAP ${poapId}:`, error);
          // Set empty array on error instead of leaving undefined
          get().setPoapHolders(poapId, []);
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
  
  const { poapHolders } = useWalletStore();

  return {
    address,
    isConnected,
    isLoading,
    userPoaps,
    matchingUsers,
    poapHolders,
    connectors,
    pendingConnector,
    connect,
    disconnect,
    loadUserData,
  };
}