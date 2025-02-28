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
  // For hackathon demo, we'll provide a more deterministic approach
  
  // Check if this is supposed to be the current user's address (for demo purposes)
  const isCurrentUser = address.toLowerCase().startsWith('0x') && 
                      (address.toLowerCase().includes('1') || 
                       address.toLowerCase().includes('a') || 
                       address.toLowerCase().includes('f'));
  
  if (isCurrentUser) {
    // Return the "real" POAPs (101-105) for the current user
    return mockPoaps.filter(poap => parseInt(poap.id) >= 101);
  } else {
    // Return random selection of mock POAPs for other addresses
    return mockPoaps
      .filter(poap => parseInt(poap.id) <= 5)
      .filter(() => Math.random() > 0.5);
  }
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
  // Original mock POAPs
  {
    id: "1",
    name: "Arbitrum Odyssey",
    description: "Completed the Arbitrum Odyssey journey by interacting with key protocols in the ecosystem",
    imageUrl: "https://i.imgur.com/2FXmoQu.png",
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
    description: "Participated in ETHGlobal 2023 hackathon and built innovative projects",
    imageUrl: "https://i.imgur.com/t8Vkz9d.png",
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
    description: "Early adopter and supporter of Arbitrum Nova during its initial launch phase",
    imageUrl: "https://i.imgur.com/RGKxyD9.png",
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
    description: "Actively participated in DeFi Summer by providing liquidity and using key protocols",
    imageUrl: "https://i.imgur.com/UzsgKhq.png",
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
    description: "Participated in Arbitrum governance by voting on key proposals and initiatives",
    imageUrl: "https://i.imgur.com/YTjYQK8.png",
    event: {
      id: "event5",
      name: "Arbitrum Governance",
      start_date: "2023-05-01",
      end_date: "2023-07-31",
      country: "Virtual",
      city: "Blockchain"
    }
  },
  
  // Real POAPs
  {
    id: "101",
    name: "ETHDenver 2024 Attendee",
    description: "Participant of ETHDenver 2024, one of the largest Ethereum hackathons in the world",
    imageUrl: "https://i.imgur.com/Nbv3WrL.png", // Example image URL
    event: {
      id: "event101",
      name: "ETHDenver 2024",
      start_date: "2024-02-23",
      end_date: "2024-03-03",
      country: "USA",
      city: "Denver"
    }
  },
  {
    id: "102",
    name: "Arbitrum Orbit Program Member",
    description: "Active participant in the Arbitrum Orbit program for L3 chains development",
    imageUrl: "https://i.imgur.com/m7xtXwG.png", // Example image URL
    event: {
      id: "event102",
      name: "Arbitrum Orbit Program",
      start_date: "2023-11-15",
      end_date: "2024-02-15",
      country: "Virtual",
      city: "Blockchain"
    }
  },
  {
    id: "103",
    name: "ETHGlobal Istanbul Attendee",
    description: "Participated in ETHGlobal Istanbul, a major Ethereum hackathon event",
    imageUrl: "https://i.imgur.com/cH9V2Wk.png", // Example image URL
    event: {
      id: "event103",
      name: "ETHGlobal Istanbul",
      start_date: "2023-11-17",
      end_date: "2023-11-19",
      country: "Turkey",
      city: "Istanbul"
    }
  },
  {
    id: "104",
    name: "Arbitrum Community Call Attendee",
    description: "Regular attendee of Arbitrum community calls and governance discussions",
    imageUrl: "https://i.imgur.com/LDh7mXR.png", // Example image URL
    event: {
      id: "event104",
      name: "Arbitrum Community Calls",
      start_date: "2023-09-01",
      end_date: "2024-01-31",
      country: "Virtual",
      city: "Blockchain"
    }
  },
  {
    id: "105",
    name: "Devcon 7 Attendee",
    description: "Participated in Devcon 7, the premier annual Ethereum developer conference",
    imageUrl: "https://i.imgur.com/3gXfTQM.png", // Example image URL
    event: {
      id: "event105",
      name: "Devcon 7",
      start_date: "2023-10-13",
      end_date: "2023-10-16",
      country: "Thailand",
      city: "Bangkok"
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
