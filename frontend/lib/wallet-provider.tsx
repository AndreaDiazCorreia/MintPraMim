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

// Get WalletConnect project ID from environment variable
// If not available, use a fallback for development only
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Custom configuration for wallet options - this lets users choose their preferred wallet
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ 
        projectId, 
        chains,
        shimDisconnect: true 
      }),
      walletConnectWallet({ 
        projectId, 
        chains,
        qrModalOptions: {
          themeMode: 'light',
          explorerRecommendedWalletIds: [
            'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
            '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'  // Trust
          ],
          explorerExcludedWalletIds: 'ALL',
          mobileLinks: ['metamask', 'trust']
        }
      }),
      coinbaseWallet({ 
        appName: 'MintPraMim', 
        chains 
      }),
    ],
  },
  {
    groupName: 'Other',
    wallets: [
      trustWallet({ 
        projectId, 
        chains,
        shimDisconnect: true 
      }),
      rainbowWallet({ projectId, chains }),
      injectedWallet({ 
        chains, 
        shimDisconnect: true 
      }),
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
        theme={theme === 'dark' ? darkTheme({
          overlayBlur: 'small',
        }) : lightTheme({
          accentColor: '#9333ea', // purple-600
          accentColorForeground: 'white',
          borderRadius: 'large',
          overlayBlur: 'small',
        })}
        modalSize="compact"
        appInfo={{
          appName: 'MintPraMim',
          learnMoreUrl: 'https://mintpramim.com',
        }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}