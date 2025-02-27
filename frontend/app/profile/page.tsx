"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  
  const interests = [
    "Art", "Music", "Movies", "Books", "Sports", "Gaming", 
    "Cooking", "Travel", "Photography", "Technology", "Fashion", 
    "Fitness", "Nature", "Politics", "Science", "History"
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
              <Link href="/explore" className="flex-1">
                <Button className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav active="profile" />
    </main>
  );
}