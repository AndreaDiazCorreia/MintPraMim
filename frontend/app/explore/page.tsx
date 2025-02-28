"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Heart, Star, MessageCircle, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { PoapDisplay } from '@/components/poap-display';
import { useWallet } from '@/lib/wallet';
import TinderCard, { API as TinderCardAPI } from 'react-tinder-card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExplorePage() {
  const { address, isConnected, userPoaps, matchingUsers, loadUserData } = useWallet();
  const [lastDirection, setLastDirection] = useState<string | undefined>();
  const [distance, setDistance] = useState([25]);
  const [ageRange, setAgeRange] = useState([18, 40]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [poapDialogOpen, setPoapDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Create refs for TinderCards to access their API methods
  const cardRefs = useRef<any[]>([]);
  
  // Fetch POAPs and matches when wallet is connected
  useEffect(() => {
    if (isConnected && address && userPoaps.length === 0) {
      loadUserData();
    }
  }, [isConnected, address, userPoaps.length, loadUserData]);
  
  const swiped = (direction: string, nameToDelete: string) => {
    console.log('removing: ' + nameToDelete + ' to the ' + direction);
    setLastDirection(direction);
    
    // Add visual feedback for the buttons
    if (direction === 'left') {
      document.getElementById('dislike-button')?.classList.add('animate-pulse', 'bg-red-50');
      setTimeout(() => {
        document.getElementById('dislike-button')?.classList.remove('animate-pulse', 'bg-red-50');
      }, 300);
    } else if (direction === 'up') {
      document.getElementById('superlike-button')?.classList.add('animate-pulse', 'bg-blue-50');
      setTimeout(() => {
        document.getElementById('superlike-button')?.classList.remove('animate-pulse', 'bg-blue-50');
      }, 300);
    } else if (direction === 'right') {
      document.getElementById('like-button')?.classList.add('animate-pulse', 'bg-purple-50');
      setTimeout(() => {
        document.getElementById('like-button')?.classList.remove('animate-pulse', 'bg-purple-50');
      }, 300);
      
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
  
  // Users to display - use matching users if they exist, otherwise empty array
  const usersToDisplay = address && matchingUsers.length > 0 
    ? matchingUsers 
    : [];
  
  // Initialize card refs when users change
  useEffect(() => {
    if (usersToDisplay.length > 0) {
      cardRefs.current = Array(usersToDisplay.length).fill(0).map((_, i) => cardRefs.current[i] || null);
      setCurrentIndex(0);
    }
  }, [usersToDisplay.length]);
    
  // For buttons to manually control swipe
  const handleManualSwipe = (direction: string) => {
    if (usersToDisplay.length > 0 && currentIndex < usersToDisplay.length) {
      // Get the current card and user
      const currentUser = usersToDisplay[currentIndex];
      
      const cardToSwipe = cardRefs.current[currentIndex];
      
      if (cardToSwipe) {
        // Apply animation class based on direction
        const card = document.querySelector('.swipe-card');
        if (card) {
          if (direction === 'left') {
            card.classList.add('swipe-left-animation');
          } else if (direction === 'right') {
            card.classList.add('swipe-right-animation');
          } else if (direction === 'up') {
            card.classList.add('swipe-up-animation');
          }
          
          // Wait for animation to complete before removing card
          setTimeout(() => {
            cardToSwipe.swipe(direction);
          }, 300);
        } else {
          // Fallback if no card element found
          cardToSwipe.swipe(direction);
        }
        
        // Visual feedback for button
        const buttonMap: Record<string, string> = {
          'left': 'dislike-button',
          'up': 'superlike-button',
          'right': 'like-button'
        };
        
        const button = document.getElementById(buttonMap[direction]);
        if (button) {
          button.classList.add('scale-110', 'shadow-lg');
          setTimeout(() => {
            button.classList.remove('scale-110', 'shadow-lg');
          }, 200);
        }
      } else {
        console.log('No card to swipe');
      }
    }
  };
  
  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Explore</h1>
          <div className="flex gap-2">
            {/* POAP Display Button */}
            {address && (
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setPoapDialogOpen(true)}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </Button>
            )}
            
            {/* Filter Button */}
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
        </div>
        
        {/* Redirect to home if wallet not connected */}
        {!address && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <Sparkles className="w-12 h-12 text-primary/40 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground max-w-xs mb-6">
              You need to connect your wallet to see potential matches based on your POAPs.
            </p>
            <WalletConnectButton 
              variant="default"
              size="lg"
              className="py-6 px-8"
            />
          </div>
        )}
        
        {/* No Matches Alert */}
        {address && userPoaps.length > 0 && matchingUsers.length === 0 && (
          <Alert className="mb-4 bg-primary/10 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              No matches found based on your POAPs. Check back later as more users join!
            </AlertDescription>
          </Alert>
        )}
        
        {/* Swipe Cards */}
        <div className="swipe-card-container h-[500px]">
          {usersToDisplay.length > 0 ? (
            // Only render the current card for better control
            usersToDisplay.slice(currentIndex, currentIndex + 1).map((user, index) => (
              <TinderCard
                key={user.id}
                ref={(element) => cardRefs.current[currentIndex] = element}
                onSwipe={(dir) => {
                  swiped(dir, user.name);
                  setCurrentIndex(prevIndex => prevIndex + 1);
                }}
                onCardLeftScreen={() => outOfFrame(user.name)}
                className="swipe-card"
              >
                <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-lg">
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0" 
                    style={{ backgroundImage: `url(${user.image})` }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent z-10" />
                  
                  <div className="absolute bottom-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-20">
                    {user.compatibility}% Match
                  </div>
                  
                  <div className="absolute top-0 left-0 right-0 p-6 z-20 text-white">
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
            ))
          ) : (
            address && userPoaps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-12 h-12 text-primary/40 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No POAPs Found</h3>
                <p className="text-muted-foreground max-w-xs">
                  Connect your wallet with POAPs to find matches with people who share your interests.
                </p>
              </div>
            ) : null
          )}
        </div>
        
        {/* Action Buttons */}
        {usersToDisplay.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              id="dislike-button"
              size="icon"
              variant="outline" 
              className="rounded-full h-16 w-16 bg-white shadow-md border-gray-200 transition-all hover:bg-red-50 p-0 flex items-center justify-center"
              onClick={() => handleManualSwipe('left')}
              aria-label="Dislike"
            >
              <X className="h-8 w-8 text-red-500" />
              <span className="sr-only">Dislike</span>
            </Button>
            
            <Button 
              id="superlike-button"
              size="icon"
              variant="outline" 
              className="rounded-full h-16 w-16 bg-white shadow-md border-gray-200 transition-all hover:bg-blue-50 p-0 flex items-center justify-center"
              onClick={() => handleManualSwipe('up')}
              aria-label="Superlike"
            >
              <Star className="h-8 w-8 text-blue-500" />
              <span className="sr-only">Superlike</span>
            </Button>
            
            <Button 
              id="like-button"
              size="icon"
              variant="outline" 
              className="rounded-full h-16 w-16 bg-white shadow-md border-gray-200 transition-all hover:bg-purple-50 p-0 flex items-center justify-center"
              onClick={() => handleManualSwipe('right')}
              aria-label="Like"
            >
              <Heart className="h-8 w-8 text-primary" />
              <span className="sr-only">Like</span>
            </Button>
          </div>
        )}
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
      
      {/* POAP Dialog */}
      <Dialog open={poapDialogOpen} onOpenChange={setPoapDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Your POAPs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              These are the POAPs in your wallet. We use these to match you with people who share similar interests.
            </p>
            <PoapDisplay poaps={userPoaps} />
          </div>
        </DialogContent>
      </Dialog>
      
      <BottomNav active="explore" />
    </main>
  );
}