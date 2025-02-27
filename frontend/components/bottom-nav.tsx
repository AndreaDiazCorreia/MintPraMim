"use client"

import Link from 'next/link';
import { Home, Search, Heart, User } from 'lucide-react';

interface BottomNavProps {
  active: 'home' | 'explore' | 'matches' | 'profile';
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <div className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${active === 'home' ? 'active' : ''}`}>
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link href="/explore" className={`bottom-nav-item ${active === 'explore' ? 'active' : ''}`}>
        <Search className="h-6 w-6" />
        <span className="text-xs mt-1">Explore</span>
      </Link>
      
      <Link href="/matches" className={`bottom-nav-item ${active === 'matches' ? 'active' : ''}`}>
        <Heart className="h-6 w-6" />
        <span className="text-xs mt-1">Matches</span>
      </Link>
      
      <Link href="/profile" className={`bottom-nav-item ${active === 'profile' ? 'active' : ''}`}>
        <User className="h-6 w-6" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
}