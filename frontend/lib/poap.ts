import { type Address } from 'viem';
import { POAP, UserProfile, mockUsers, mockPoaps } from './utils';

// Base URL for POAP API
const POAP_API_URL = 'https://api.poap.tech';
const POAP_API_ARBITRUM_URL = 'https://api.poap.tech/actions/scan/arbitrum';

// For testing purposes, we'll use mock data since we can't directly access the POAP API from the frontend
export async function fetchUserPoapsFromBlockchain(address: Address): Promise<POAP[]> {
  try {
    // Skip the actual API call and use mock data directly
    // In a real app, this would be a backend call with proper API key handling
    
    // Simulating a slight delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if this is supposed to be the current user's address (for demo purposes)
    const isCurrentUser = address.toLowerCase().startsWith('0x') && 
                        (address.toLowerCase().includes('1') || 
                        address.toLowerCase().includes('a') || 
                        address.toLowerCase().includes('f'));
    
    if (isCurrentUser) {
      // Import mockPoaps from utils
      const { mockPoaps } = await import('./utils');
      // Return the "real" POAPs (101-105) for the current user
      return mockPoaps.filter(poap => parseInt(poap.id) >= 101);
    } else {
      // Return random selection of mock POAPs for other addresses
      const { mockPoaps } = await import('./utils');
      return getMockPoapsForAddress(address, mockPoaps);
    }
  } catch (error) {
    console.error('Error fetching POAPs:', error);
    // Use a safer fallback
    const { mockPoaps } = await import('./utils');
    return getMockPoapsForAddress(address, mockPoaps);
  }
}

// Helper function to get mock POAPs for an address
function getMockPoapsForAddress(address: Address, mockPoapsArray: POAP[]): POAP[] {
  // Use the address as a seed for deterministic randomness
  let seedValue = parseInt(address.slice(2, 10), 16);
  const random = new Proxy({}, {
    get: () => () => {
      const x = Math.sin(seedValue++) * 10000;
      return x - Math.floor(x);
    }
  }) as { random: () => number };
  
  // Filter original POAPs (IDs 1-5)
  const originalPoaps = mockPoapsArray.filter(poap => parseInt(poap.id) <= 5);
  
  // Select 2-4 random POAPs
  const numPoaps = 2 + Math.floor(random.random() * 3);
  const shuffled = [...originalPoaps].sort(() => random.random() - 0.5);
  return shuffled.slice(0, numPoaps);
}

// Function to get POAP holders - in a real app this would query an API
export async function getPoapHolders(poapId: string): Promise<Address[]> {
  try {
    // Skip the actual API call and use mock data directly
    // In a real app, this would be a backend call with proper API key handling
    
    // Simulating a slight delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return mock holders directly
    return getMockPoapHolders(poapId);
  } catch (error) {
    console.error('Error fetching POAP holders:', error);
    // Return mock data
    return getMockPoapHolders(poapId);
  }
}

// This function is now replaced by getMockPoapsForAddress and not used

// Get mock POAP holders
async function getMockPoapHolders(poapId: string): Promise<Address[]> {
  // Import mockUsers from utils to avoid direct reference
  const { mockUsers } = await import('./utils');
  
  // Generate mock addresses for holders
  const numHolders = 10 + Math.floor(Math.random() * 20);
  const holders: Address[] = [];
  
  for (let i = 0; i < numHolders; i++) {
    // Generate a random Ethereum address
    const randomHex = [...Array(40)].map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    holders.push(`0x${randomHex}` as Address);
  }
  
  // Add actual mock users that have this POAP
  mockUsers.forEach(user => {
    if (user.poaps.some(poap => poap.id === poapId)) {
      // Convert a string-based mock ID to an address-like format
      const mockAddress = `0x${user.id.padStart(40, '0')}` as Address;
      holders.push(mockAddress);
    }
  });
  
  return holders;
}

// Function to match users based on shared POAPs
export async function findMatchingUsersFromPoaps(userPoaps: POAP[]): Promise<UserProfile[]> {
  // Import mockUsers from utils to avoid direct reference
  const { mockUsers } = await import('./utils');
  
  const poapIds = userPoaps.map(poap => poap.id);
  
  return mockUsers.filter(user => {
    // Find users who have at least one matching POAP
    const sharedPoaps = user.poaps.filter(poap => poapIds.includes(poap.id));
    return sharedPoaps.length > 0;
  }).map(user => ({
    ...user,
    // Calculate a compatibility score based on number of shared POAPs
    compatibility: Math.min(
      95, 
      60 + Math.floor((user.poaps.filter(poap => poapIds.includes(poap.id)).length / userPoaps.length) * 40)
    )
  }));
}