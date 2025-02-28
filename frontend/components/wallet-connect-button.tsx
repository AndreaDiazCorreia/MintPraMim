"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWallet } from "@/lib/wallet";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnectButton({
  variant = "default",
  size = "default",
  className = "",
  showProfileOnConnect = false,
}) {
  const { address, isConnected, isLoading, connect, disconnect, loadUserData } = useWallet();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`;
  };

  // Load user data when connected
  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    }
  }, [isConnected, address]);

  // Trigger dialog close on successful connection
  useEffect(() => {
    if (isConnected) {
      setDialogOpen(false);
    }
  }, [isConnected]);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size={size}
          className={`font-mono ${className}`}
          onClick={() => setDialogOpen(true)}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {formatAddress(address)}
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Wallet Connected</DialogTitle>
              <DialogDescription>
                Your wallet is connected to MintPraMim.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-lg font-mono mb-2">{formatAddress(address)}</p>
              <p className="text-sm text-muted-foreground mb-6">Connected to Arbitrum Network</p>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={() => disconnect()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to find matches with users who share your POAPs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            {/* Custom RainbowKit button display */}
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
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="flex gap-2 py-6 px-5 text-lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Connecting...</span>
                              </>
                            ) : (
                              <>
                                <Wallet className="w-5 h-5" />
                                <span>Connect Wallet</span>
                              </>
                            )}
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button 
                            onClick={openChainModal} 
                            variant="destructive"
                            className="flex gap-2 py-6 px-5 text-lg"
                          >
                            Wrong Network
                          </Button>
                        );
                      }

                      return (
                        <div className="flex gap-3">
                          <Button
                            onClick={openChainModal}
                            variant="outline"
                            className="flex gap-2 py-5 px-4"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 20,
                                  height: 20,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 20, height: 20 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </Button>

                          <Button
                            onClick={openAccountModal}
                            className="flex gap-2 py-5 px-4"
                          >
                            {account.displayName}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}