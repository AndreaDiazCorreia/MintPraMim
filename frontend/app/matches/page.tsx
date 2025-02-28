"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageCircle, Sparkles, Heart, Star, Gift } from 'lucide-react';
import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';

// Mock matches data
const matches = [
  {
    id: 1,
    name: "Sophia",
    lastMessage: "Would you like to meet for coffee this weekend?",
    time: "2m ago",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    unread: 2,
    verified: true
  },
  {
    id: 2,
    name: "Alex",
    lastMessage: "That hiking trail looks amazing! When are you free?",
    time: "1h ago",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    unread: 0,
    verified: true
  },
  {
    id: 3,
    name: "Emma",
    lastMessage: "I just finished that book you recommended. It was amazing!",
    time: "Yesterday",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    unread: 0,
    verified: false
  },
  {
    id: 4,
    name: "James",
    lastMessage: "Are you going to the concert next week?",
    time: "2d ago",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    unread: 0,
    verified: false
  }
];

export default function MatchesPage() {
  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Matches</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search matches" 
            className="pl-10 rounded-xl bg-secondary border-0"
          />
        </div>
        
        <div className="space-y-1">
          {matches.map((match) => (
            <Link href={`/chat/${match.id}`} key={match.id}>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                    <AvatarImage src={match.image} alt={match.name} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {match.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {match.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">{match.name}</h3>
                    <span className="text-xs text-muted-foreground">{match.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{match.lastMessage}</p>
                </div>
                
                {match.unread > 0 && (
                  <div className="bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                    {match.unread}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {/* NFT Badges Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Special NFT Badges</h2>
            <Button variant="link" className="text-primary p-0">View All</Button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex flex-col items-center space-y-2 min-w-[80px]">
              <div className="nft-badge w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500">
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <span className="text-xs text-center">Early Adopter</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2 min-w-[80px]">
              <div className="nft-badge w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500">
                <div className="w-full h-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <span className="text-xs text-center">Match Maker</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2 min-w-[80px]">
              <div className="nft-badge w-20 h-20 bg-gradient-to-br from-blue-400 to-green-500">
                <div className="w-full h-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>
              <span className="text-xs text-center">Verified</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2 min-w-[80px]">
              <div className="nft-badge w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500">
                <div className="w-full h-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-white" />
                </div>
              </div>
              <span className="text-xs text-center">Gift Giver</span>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav active="matches" />
    </main>
  );
}
