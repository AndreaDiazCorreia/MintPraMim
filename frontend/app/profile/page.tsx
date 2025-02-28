"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { PoapDisplay } from '@/components/poap-display';
import { BottomNav } from '@/components/bottom-nav';
import { 
  Camera, ArrowRight, Sparkles, LucideEdit, LogOut, ChevronRight, 
  User, Settings, Heart, Bell, Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet';

export default function ProfilePage() {
  const router = useRouter();
  const { address, isConnected, userPoaps, disconnect } = useWallet();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  
  // Web3 related interests
  const interests = [
    "DeFi", "NFTs", "Web3", "Metaverse", "DAOs", "Crypto", 
    "Smart Contracts", "Layer 2", "Arbitrum", "Ethereum", "Blockchain", 
    "Hackathons", "Trading", "Yield Farming", "Gaming", "Tech"
  ];
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };
  
  const handleLogout = () => {
    disconnect();
    router.push('/');
  };

  // Show profile creation if wallet is connected but no profile exists
  // For the hackathon, we'll assume the profile exists if the wallet is connected
  const hasProfile = isConnected && !!address;
  
  if (hasProfile && !isEditingProfile) {
    // Profile exists, show profile view
    return (
      <main className="min-h-screen pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* User Profile Card */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80" alt="User" />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>São Paulo, Brazil</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={() => setIsEditingProfile(true)}
                >
                  <LucideEdit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Web3 enthusiast and crypto lover. Looking for others who share my passion for blockchain technology!
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Crypto", "DeFi", "NFTs", "Web3", "Metaverse"].map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Information */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm text-muted-foreground mb-3">
                {address}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Connected to Arbitrum Network
              </p>
            </CardContent>
          </Card>

          {/* POAPs */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your POAPs
              </CardTitle>
              <CardDescription>
                Proof of attendance tokens that help you find matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PoapDisplay poaps={userPoaps} />
            </CardContent>
          </Card>

          {/* Settings Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0 divide-y">
                <Button variant="ghost" className="w-full justify-start rounded-none py-6 px-6">
                  <User className="h-5 w-5 mr-3 text-primary" />
                  <span>Account Settings</span>
                  <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" className="w-full justify-start rounded-none py-6 px-6">
                  <Bell className="h-5 w-5 mr-3 text-primary" />
                  <span>Notifications</span>
                  <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" className="w-full justify-start rounded-none py-6 px-6">
                  <Settings className="h-5 w-5 mr-3 text-primary" />
                  <span>Privacy & Security</span>
                  <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" className="w-full justify-start rounded-none py-6 px-6">
                  <Heart className="h-5 w-5 mr-3 text-primary" />
                  <span>Match Preferences</span>
                  <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <BottomNav active="profile" />
        </div>
      </main>
    );
  }
  
  // Wallet not connected, show connect prompt
  if (!address) {
    return (
      <main className="min-h-screen pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Connect your wallet to access your profile and find matches based on your POAPs.
            </p>
            <WalletConnectButton variant="default" size="lg" className="mb-3" />
          </div>
          
          <BottomNav active="profile" />
        </div>
      </main>
    );
  }
  
  // Profile creation/editing flow
  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-md mx-auto p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Create Your Profile</h1>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80" />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <Sparkles className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary/90 shadow-md">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Enter your name" className="rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell others about yourself..." 
                  className="rounded-xl min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>I am</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Looking for</Label>
                <RadioGroup value={lookingFor} onValueChange={setLookingFor} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="men" id="men" />
                    <Label htmlFor="men">Men</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="women" id="women" />
                    <Label htmlFor="women">Women</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="everyone" id="everyone" />
                    <Label htmlFor="everyone">Everyone</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                className="w-full py-6 rounded-xl mt-6 bg-primary hover:bg-primary/90"
                onClick={() => setStep(2)}
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Your Interests</h1>
              <p className="text-muted-foreground">Select up to 5 interests</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {interests.map((interest) => (
                <div
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`
                    rounded-xl p-3 text-center cursor-pointer transition-all
                    ${selectedInterests.includes(interest) 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                  `}
                >
                  {interest}
                </div>
              ))}
            </div>
            
            <div className="pt-6 flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 py-6 rounded-xl border-purple-200"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                className="flex-1 py-6 rounded-xl bg-primary hover:bg-primary/90"
                onClick={() => setIsEditingProfile(false)}
              >
                {isEditingProfile ? 'Save Changes' : 'Complete Profile'}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav active="profile" />
    </main>
  );
}