"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Heart, Star, MessageCircle, Filter } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import TinderCard from 'react-tinder-card';

// Mock user data
const users = [
  {
    id: 1,
    name: "Sophia",
    age: 28,
    bio: "Art lover and coffee enthusiast. Looking for someone to explore galleries with.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    compatibility: 87,
    interests: ["Art", "Coffee", "Travel", "Photography"]
  },
  {
    id: 2,
    name: "Alex",
    age: 32,
    bio: "Tech geek and hiking enthusiast. Let's talk about the latest gadgets while climbing mountains.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    compatibility: 92,
    interests: ["Technology", "Hiking", "Gaming", "Movies"]
  },
  {
    id: 3,
    name: "Emma",
    age: 26,
    bio: "Bookworm and yoga instructor. Looking for deep conversations and peaceful moments.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    compatibility: 75,
    interests: ["Books", "Yoga", "Meditation", "Nature"]
  }
];

export default function ExplorePage() {
  const [lastDirection, setLastDirection] = useState<string | undefined>();
  const [distance, setDistance] = useState([25]);
  const [ageRange, setAgeRange] = useState([18, 40]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  
  const swiped = (direction: string, nameToDelete: string) => {
    console.log('removing: ' + nameToDelete + ' to the ' + direction);
    setLastDirection(direction);
    
    // In a real app, this would handle the match logic
    if (direction === 'right') {
      // Simulate a match with 30% probability
      if (Math.random() < 0.3) {
        // Show match animation
        document.getElementById('match-popup')?.classList.remove('hidden');
        setTimeout(() => {
          document.getElementById('match-popup')?.classList.add('hidden');
        }, 3000);
      }
    }
  };
  
  const outOfFrame = (name: string) => {
    console.log(name + ' left the screen!');
  };
  
  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Explore</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Filter className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Filter Preferences</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Distance</Label>
                    <span className="text-sm text-muted-foreground">{distance[0]} km</span>
                  </div>
                  <Slider
                    value={distance}
                    onValueChange={setDistance}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Age Range</Label>
                    <span className="text-sm text-muted-foreground">{ageRange[0]} - {ageRange[1]}</span>
                  </div>
                  <Slider
                    value={ageRange}
                    onValueChange={setAgeRange}
                    max={80}
                    min={18}
                    step={1}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="verified-only">Verified profiles only</Label>
                  <Switch
                    id="verified-only"
                    checked={showVerifiedOnly}
                    onCheckedChange={setShowVerifiedOnly}
                  />
                </div>
                
                <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="swipe-card-container">
          {users.map((user) => (
            <TinderCard
              key={user.id}
              onSwipe={(dir) => swiped(dir, user.name)}
              onCardLeftScreen={() => outOfFrame(user.name)}
              className="swipe-card"
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg">
                <div 
                  className="absolute inset-0 bg-cover bg-center z-0" 
                  style={{ backgroundImage: `url(${user.image})` }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                
                <div className="compatibility-badge">
                  {user.compatibility}%
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                  <h2 className="text-2xl font-bold">{user.name}, {user.age}</h2>
                  <p className="text-white/80 mb-3">{user.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.interests.map((interest) => (
                      <span 
                        key={interest} 
                        className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </TinderCard>
          ))}
        </div>
        
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full h-16 w-16 bg-white shadow-md border-gray-200"
          >
            <X className="h-8 w-8 text-red-500" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full h-16 w-16 bg-white shadow-md border-gray-200"
          >
            <Star className="h-8 w-8 text-blue-500" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full h-16 w-16 bg-white shadow-md border-gray-200"
          >
            <Heart className="h-8 w-8 text-primary" />
          </Button>
        </div>
      </div>
      
      {/* Match popup */}
      <div id="match-popup" className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 hidden">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center match-animation">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80" 
                  alt="Match" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 transform translate-x-6">
                <Heart className="text-primary fill-primary w-8 h-8" />
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white absolute left-12">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80" 
                  alt="You" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400">
            It's a Match!
          </h2>
          <p className="text-gray-600 mb-6">You and Alex liked each other</p>
          
          <div className="space-y-3">
            <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send a Message
            </Button>
            <Button variant="outline" className="w-full rounded-xl border-purple-200">
              Keep Exploring
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNav active="explore" />
    </main>
  );
}