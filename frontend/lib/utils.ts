import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Add TypeScript declaration for ethereum provider
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      [key: string]: any;
    };
  }
}

export function hasMetaMaskExtension() {
  if (typeof window === 'undefined') return false;
  return window.ethereum && window.ethereum.isMetaMask;
}

export function openMetaMaskDeepLink() {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  // Creates a direct deep link to open MetaMask with current URL
  window.location.href = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, '')}`;
}

// Mock POAP API for hackathon
export type POAP = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  event: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    country: string;
    city: string;
  };
}

export type UserProfile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  poaps: POAP[];
  interests: string[];
  compatibility?: number;
}

// Fetch user's POAPs from Arbitrum network
export async function fetchUserPoaps(address: string): Promise<POAP[]> {
  // This would be a real API call in production
  // For hackathon, return mock data
  return mockPoaps.filter(() => Math.random() > 0.5); // Randomly select some POAPs
}

// Find users with matching POAPs
export function findMatchingUsers(userPoaps: POAP[]): UserProfile[] {
  // In a real app, this would query a backend API
  // For hackathon, use mock data and filter based on shared POAPs
  
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

// Mock POAPs for hackathon demo
const mockPoaps: POAP[] = [
  {
    id: "1",
    name: "Arbitrum Odyssey",
    description: "Completed the Arbitrum Odyssey journey",
    imageUrl: "https://arweave.net/s/SomeArbitrumOdysseyImage",
    event: {
      id: "event1",
      name: "Arbitrum Odyssey",
      start_date: "2023-10-01",
      end_date: "2023-10-14",
      country: "Virtual",
      city: "Blockchain"
    }
  },
  {
    id: "2",
    name: "ETHGlobal 2023 Attendee",
    description: "Attended ETHGlobal 2023 hackathon",
    imageUrl: "https://arweave.net/s/SomeETHGlobalImage",
    event: {
      id: "event2",
      name: "ETHGlobal 2023",
      start_date: "2023-09-15",
      end_date: "2023-09-17",
      country: "USA",
      city: "San Francisco"
    }
  },
  {
    id: "3",
    name: "Arbitrum Nova Launch",
    description: "Early user of Arbitrum Nova",
    imageUrl: "https://arweave.net/s/SomeArbitrumNovaImage",
    event: {
      id: "event3",
      name: "Arbitrum Nova Launch",
      start_date: "2023-08-01",
      end_date: "2023-08-01",
      country: "Virtual",
      city: "Blockchain"
    }
  },
  {
    id: "4",
    name: "DeFi Summer Contributor",
    description: "Participated in DeFi Summer protocols",
    imageUrl: "https://arweave.net/s/SomeDeFiSummerImage",
    event: {
      id: "event4",
      name: "DeFi Summer",
      start_date: "2023-06-01",
      end_date: "2023-08-31",
      country: "Virtual",
      city: "Blockchain"
    }
  },
  {
    id: "5",
    name: "Arbitrum Governance Voter",
    description: "Voted in Arbitrum governance proposals",
    imageUrl: "https://arweave.net/s/SomeArbitrumGovernanceImage",
    event: {
      id: "event5",
      name: "Arbitrum Governance",
      start_date: "2023-05-01",
      end_date: "2023-07-31",
      country: "Virtual",
      city: "Blockchain"
    }
  }
];

// Mock users with POAPs for the hackathon demo
const mockUsers: UserProfile[] = [
  {
    id: "1",
    name: "Sophia",
    age: 28,
    bio: "Web3 developer and DeFi enthusiast. Love attending hackathons and building on Arbitrum!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    poaps: [mockPoaps[0], mockPoaps[1], mockPoaps[4]],
    interests: ["Web3", "DeFi", "Hackathons", "Arbitrum"]
  },
  {
    id: "2",
    name: "Alex",
    age: 32,
    bio: "Smart contract developer specializing in Arbitrum. Looking to connect with other builders!",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    poaps: [mockPoaps[0], mockPoaps[2], mockPoaps[3]],
    interests: ["Smart Contracts", "Solidity", "L2 Scaling", "Zero Knowledge"]
  },
  {
    id: "3",
    name: "Emma",
    age: 26,
    bio: "NFT artist and crypto collector. Active in governance on Arbitrum and other chains.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    poaps: [mockPoaps[1], mockPoaps[4]],
    interests: ["NFTs", "Digital Art", "DAO Governance", "Collecting"]
  },
  {
    id: "4",
    name: "Marcus",
    age: 30,
    bio: "DeFi researcher and early Arbitrum user. Looking to discuss L2 innovation and scaling solutions.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    poaps: [mockPoaps[0], mockPoaps[2], mockPoaps[4]],
    interests: ["DeFi", "Yield Farming", "MEV", "L2 Scaling"]
  },
  {
    id: "5",
    name: "Zoe",
    age: 25,
    bio: "Community manager for an Arbitrum protocol. Love connecting people in the ecosystem!",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1961&q=80",
    poaps: [mockPoaps[1], mockPoaps[3]],
    interests: ["Community", "Events", "Marketing", "Education"]
  },
];
