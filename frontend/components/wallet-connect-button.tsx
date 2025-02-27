"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2, ExternalLink } from "lucide-react";
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
import { isMobileDevice, hasMetaMaskExtension, openMetaMaskDeepLink } from "@/lib/utils";

interface WalletConnectButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showProfileOnConnect?: boolean;
}

export function WalletConnectButton({
  variant = "default",
  size = "default",
  className = "",
  showProfileOnConnect = false,
}: WalletConnectButtonProps) {
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
        <Button variant={variant} size={size} className={className} type="button">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to find matches with users who share your POAPs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center w-full">
            {/* Custom RainbowKit button display */}
            <div className="w-full space-y-3">
              {/* Direct MetaMask App button for mobile */}
              <Button 
                onClick={() => {
                  // This direct deep link will open the MetaMask app on mobile
                  window.location.href = `https://metamask.app.link/dapp/${window.location.href.replace(/^https?:\/\//, '')}`;
                }}
                className="flex gap-2 py-6 px-5 text-lg w-full bg-[#F6851B] hover:bg-[#E2761B] text-white"
                type="button"
              >
                <img 
                  src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                  alt="MetaMask"
                  className="h-6 w-6"
                />
                <span>Open in MetaMask</span>
              </Button>
              
              {/* Other wallets using RainbowKit */}
              <p className="text-center font-semibold my-2">OR</p>
              
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
                      {!connected ? (
                        <Button
                          onClick={openConnectModal}
                          className="flex gap-2 py-6 px-5 text-lg w-full"
                          disabled={isLoading}
                          type="button"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <>
                              <Wallet className="w-5 h-5" />
                              <span>Choose other wallet</span>
                            </>
                          )}
                        </Button>
                      ) : null}

                      {chain && chain.unsupported && (
                        <Button 
                          onClick={openChainModal} 
                          variant="destructive"
                          className="flex gap-2 py-6 px-5 text-lg"
                        >
                          Wrong Network
                        </Button>
                      )}

                      {connected && chain && !chain.unsupported && (
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
                      )}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}