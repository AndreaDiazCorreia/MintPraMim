import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Wallet } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-20 h-20 blob-shape bg-gradient-to-br from-purple-200 to-purple-300 opacity-50 animate-pulse"></div>
      <div className="absolute bottom-40 left-10 w-16 h-16 blob-shape bg-gradient-to-tr from-blue-200 to-purple-200 opacity-40"></div>
      
      {/* Logo and title */}
      <div className="mb-12 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 mb-2">
          MintParaMim
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Connect with people who share your interests and create meaningful connections
        </p>
      </div>
      
      {/* Main content */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-purple-100">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome</h2>
            <p className="text-muted-foreground">Connect your wallet to get started</p>
          </div>
          
          <Button className="w-full py-6 text-lg rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-2">
            <Wallet className="w-5 h-5 mr-1" />
            Connect Wallet
          </Button>
          
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-gray-200 flex-grow"></div>
            <span className="mx-4 text-sm text-muted-foreground">or</span>
            <div className="border-t border-gray-200 flex-grow"></div>
          </div>
          
          <Link href="/explore" className="block w-full">
            <Button variant="outline" className="w-full py-6 text-lg rounded-xl border-purple-200 hover:bg-purple-50 text-primary">
              Continue as Guest
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Find your perfect match</span>
          </div>
        </div>
      </div>
      
      {/* Stats at bottom */}
      <div className="mt-12 flex justify-center gap-8 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">10k+</p>
          <p className="text-sm text-muted-foreground">Users</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">5k+</p>
          <p className="text-sm text-muted-foreground">Matches</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">1k+</p>
          <p className="text-sm text-muted-foreground">NFTs Minted</p>
        </div>
      </div>
      
      {/* PWA install prompt - this would be conditionally rendered in a real app */}
      <div className="pwa-prompt hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Add MintParaMim to Home Screen</h3>
              <p className="text-sm text-muted-foreground">For the best experience</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Later</Button>
            <Button size="sm">Install</Button>
          </div>
        </div>
      </div>
    </main>
  );
}