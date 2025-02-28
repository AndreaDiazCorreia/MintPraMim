"use client";

import { ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { arbitrum, arbitrumGoerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { 
  metaMaskWallet, 
  coinbaseWallet, 
  walletConnectWallet,
  rainbowWallet,
  trustWallet,
  injectedWallet
} from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';
import { useTheme } from 'next-themes';

// Configure chains for Arbitrum
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrum, arbitrumGoerli],
  [
    // Using public provider since we don't have API keys in the demo
    publicProvider(),
  ]
);

// For development, we'll use a hardcoded project ID
// In production, this should be an environment variable
const projectId = "3ae9635d26a3950bf9943762235b2337";

// Custom configuration for wallet options - this lets users choose their preferred wallet
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId, chains }),
      coinbaseWallet({ appName: 'MintPraMim', chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
  {
    groupName: 'Other',
    wallets: [
      trustWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
      injectedWallet({ chains }),
    ],
  },
]);

// Create wagmi config
const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        chains={chains}
        initialChain={arbitrum}
        showRecentTransactions={true}
        theme={theme === 'dark' ? darkTheme() : lightTheme({
          accentColor: '#9333ea', // purple-600
          accentColorForeground: 'white',
          borderRadius: 'large',
        })}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}