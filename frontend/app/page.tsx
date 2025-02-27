"use client";

import { Button } from '@/components/ui/button';
import { Sparkles, Heart } from 'lucide-react';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { useWallet } from '@/lib/wallet';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  const { address, isConnected } = useWallet();
  const router = useRouter();
  
  // Redirect to explore page if wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      router.push('/explore');
    }
  }, [isConnected, address, router]);
  
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
          MintPraMim
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Conecte-se com pessoas que compartilham seus POAP NFTs e crie conexões significativas
        </p>
      </div>
      
      {/* Main content */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-purple-100">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Bem-vindo</h2>
            <p className="text-muted-foreground">Conecte sua carteira para encontrar matches com base nos seus POAPs</p>
          </div>
          
          <div className="flex justify-center">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                    className="w-full"
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="w-full py-6 text-lg rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-5 h-5" />
                            <span>Conectar Carteira</span>
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button 
                            onClick={openChainModal} 
                            className="w-full py-6 text-lg rounded-xl bg-destructive hover:bg-destructive/90"
                          >
                            Mudar para Arbitrum
                          </Button>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-3 w-full">
                          <Button
                            onClick={openAccountModal}
                            className="w-full py-6 text-lg rounded-xl bg-primary hover:bg-primary/90"
                          >
                            {account.displayName}
                          </Button>
                          <div className="text-center text-sm">
                            <span>Conectado à {chain.name}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Ao continuar, você concorda com nossos Termos e Política de Privacidade
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Encontre seu match perfeito</span>
          </div>
        </div>
      </div>
      
      {/* Stats at bottom */}
      <div className="mt-12 flex justify-center gap-8 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">100+</p>
          <p className="text-sm text-muted-foreground">POAPs Suportados</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">500+</p>
          <p className="text-sm text-muted-foreground">Matches</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">1k+</p>
          <p className="text-sm text-muted-foreground">Conexões Feitas</p>
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
              <h3 className="font-semibold">Adicione MintPraMim à Tela Inicial</h3>
              <p className="text-sm text-muted-foreground">Para a melhor experiência</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Depois</Button>
            <Button size="sm">Instalar</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
