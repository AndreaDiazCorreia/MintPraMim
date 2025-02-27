"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Image, Gift, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Mock chat data
const chatData = {
  id: 1,
  name: "Sophia",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
  verified: true,
  compatibility: 87,
  messages: [
    {
      id: 1,
      text: "Hi there! I noticed we both love art exhibitions. Have you been to any good ones lately?",
      sender: "them",
      time: "Yesterday, 2:30 PM"
    },
    {
      id: 2,
      text: "Hey Sophia! Yes, I went to the modern art exhibition at the downtown gallery last weekend. It was amazing!",
      sender: "me",
      time: "Yesterday, 2:45 PM"
    },
    {
      id: 3,
      text: "That sounds wonderful! I've been meaning to check that one out. Would you like to go together sometime?",
      sender: "them",
      time: "Yesterday, 3:00 PM"
    },
    {
      id: 4,
      text: "I'd love that! How about this Saturday afternoon?",
      sender: "me",
      time: "Yesterday, 3:05 PM"
    },
    {
      id: 5,
      text: "Saturday works perfectly for me. Looking forward to it! 😊",
      sender: "them",
      time: "Yesterday, 3:10 PM"
    },
    {
      id: 6,
      text: "Great! Should we meet at the gallery around 2 PM?",
      sender: "me",
      time: "Yesterday, 3:15 PM"
    },
    {
      id: 7,
      text: "2 PM sounds perfect. I'll see you there!",
      sender: "them",
      time: "Yesterday, 3:20 PM"
    }
  ]
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const [newMessage, setNewMessage] = useState("");
  
  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    // In a real app, this would send the message to the backend
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      {/* Chat header */}
      <div className="border-b border-border p-4 flex items-center gap-3 sticky top-0 bg-background z-10">
        <Link href="/matches">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatData.image} alt={chatData.name} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {chatData.name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h2 className="font-semibold">{chatData.name}</h2>
            {chatData.verified && (
              <Sparkles className="h-3 w-3 text-primary" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {chatData.compatibility}% compatibility
          </p>
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <Gift className="h-5 w-5 text-primary" />
        </Button>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {chatData.messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`chat-bubble ${message.sender === 'me' ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
              <p>{message.text}</p>
              <p className="text-xs opacity-70 mt-1">{message.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Message input */}
      <div className="border-t border-border p-4 sticky bottom-0 bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Image className="h-5 w-5 text-primary" />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="rounded-full bg-secondary border-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          
          <Button 
            size="icon" 
            className="rounded-full bg-primary hover:bg-primary/90"
            onClick={sendMessage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </main>
  );
}