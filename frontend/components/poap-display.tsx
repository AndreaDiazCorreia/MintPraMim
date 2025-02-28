"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CalendarDays, MapPin, X, Users } from "lucide-react";
import { type POAP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { isMobileDevice } from "@/lib/utils";
import { useWallet } from "@/lib/wallet";

export function PoapDisplay({ poaps }: { poaps: POAP[] }) {
  const [selectedPoap, setSelectedPoap] = useState<POAP | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' ? isMobileDevice() : false;
  const { poapHolders } = useWallet();

  // Helper function to get POAP image URL from Imgur
  const getPoapImageUrl = (id: string) => {
    const imageMap: Record<string, string> = {
      // Original mock POAPs
      "1": "https://i.imgur.com/2FXmoQu.png", // Arbitrum Odyssey
      "2": "https://i.imgur.com/t8Vkz9d.png", // ETHGlobal
      "3": "https://i.imgur.com/RGKxyD9.png", // Arbitrum Nova
      "4": "https://i.imgur.com/UzsgKhq.png", // DeFi Summer
      "5": "https://i.imgur.com/YTjYQK8.png", // Arbitrum Governance
      
      // Real POAPs
      "101": "https://i.imgur.com/Nbv3WrL.png", // ETHDenver 2024
      "102": "https://i.imgur.com/m7xtXwG.png", // Arbitrum Orbit
      "103": "https://i.imgur.com/cH9V2Wk.png", // ETHGlobal Istanbul
      "104": "https://i.imgur.com/LDh7mXR.png", // Arbitrum Community
      "105": "https://i.imgur.com/3gXfTQM.png", // Devcon 7
    };
    
    return imageMap[id] || "";
  };
  
  if (!poaps || poaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 border rounded-lg border-dashed">
        <p className="text-muted-foreground">Nenhum POAP encontrado</p>
      </div>
    );
  }

  // Handle opening the dialog on mobile or fallback for empty POAPs
  const handlePoapClick = (poap: POAP) => {
    if (isMobile) {
      setSelectedPoap(poap);
      setDialogOpen(true);
    }
  };
  
  // Ensure we have a non-null array of POAPs
  const safePoaps = Array.isArray(poaps) ? poaps : [];

  return (
    <>
      <ScrollArea className="h-60">
        <div className="flex flex-wrap gap-3 p-1">
          {safePoaps.map((poap) => (
            <div key={poap.id}>
              {isMobile ? (
                <Card 
                  className="w-[90px] h-[110px] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all active:bg-gray-50"
                  onClick={() => handlePoapClick(poap)}
                >
                  <CardContent className="p-2 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mb-2 flex items-center justify-center overflow-hidden">
                      <img 
                        src={getPoapImageUrl(poap.id)} 
                        alt={poap.name} 
                        className="w-full h-full object-cover" 
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          // Fallback for image loading errors with support for new POAPs
                          const poapIdNum = parseInt(poap.id);
                          let fallbackImg = "Placeholder";
                          
                          if (poapIdNum <= 5) {
                            // Original POAPs
                            fallbackImg = poap.id === "1" ? "2FXmoQu" : 
                                          poap.id === "2" ? "t8Vkz9d" : 
                                          poap.id === "3" ? "RGKxyD9" : 
                                          poap.id === "4" ? "UzsgKhq" : 
                                          poap.id === "5" ? "YTjYQK8" : "Placeholder";
                          } else {
                            // Real POAPs
                            fallbackImg = poap.id === "101" ? "Nbv3WrL" : 
                                          poap.id === "102" ? "m7xtXwG" : 
                                          poap.id === "103" ? "cH9V2Wk" : 
                                          poap.id === "104" ? "LDh7mXR" : 
                                          poap.id === "105" ? "3gXfTQM" : "Placeholder";
                          }
                          
                          e.currentTarget.src = `https://i.imgur.com/${fallbackImg}.png`;
                        }}
                      />
                    </div>
                    <p className="text-xs line-clamp-2 h-8">{poap.name}</p>
                  </CardContent>
                </Card>
              ) : (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Card className="w-[90px] h-[110px] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all">
                      <CardContent className="p-2 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mb-2 flex items-center justify-center overflow-hidden">
                          <img 
                            src={getPoapImageUrl(poap.id)} 
                            alt={poap.name}
                            className="w-full h-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              // Fallback for image loading errors
                              e.currentTarget.src = `https://i.imgur.com/${poap.id === "1" ? "2FXmoQu" : poap.id === "2" ? "t8Vkz9d" : poap.id === "3" ? "RGKxyD9" : poap.id === "4" ? "UzsgKhq" : poap.id === "5" ? "YTjYQK8" : "Placeholder"}.png`;
                            }}
                          />
                        </div>
                        <p className="text-xs line-clamp-2 h-8">{poap.name}</p>
                      </CardContent>
                    </Card>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img 
                          src={getPoapImageUrl(poap.id)} 
                          alt={poap.name}
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            // Fallback for image loading errors with support for new POAPs
                            const poapIdNum = parseInt(poap.id);
                            let fallbackImg = "Placeholder";
                            
                            if (poapIdNum <= 5) {
                              // Original POAPs
                              fallbackImg = poap.id === "1" ? "2FXmoQu" : 
                                            poap.id === "2" ? "t8Vkz9d" : 
                                            poap.id === "3" ? "RGKxyD9" : 
                                            poap.id === "4" ? "UzsgKhq" : 
                                            poap.id === "5" ? "YTjYQK8" : "Placeholder";
                            } else {
                              // Real POAPs
                              fallbackImg = poap.id === "101" ? "Nbv3WrL" : 
                                            poap.id === "102" ? "m7xtXwG" : 
                                            poap.id === "103" ? "cH9V2Wk" : 
                                            poap.id === "104" ? "LDh7mXR" : 
                                            poap.id === "105" ? "3gXfTQM" : "Placeholder";
                            }
                            
                            e.currentTarget.src = `https://i.imgur.com/${fallbackImg}.png`;
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{poap.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {poap.description}
                        </p>
                        <div className="flex items-center pt-2">
                          <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(poap.event.start_date).toLocaleDateString()} - {new Date(poap.event.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center pt-1">
                          <MapPin className="mr-2 h-4 w-4 opacity-70" />
                          <span className="text-xs text-muted-foreground">
                            {poap.event.city}, {poap.event.country}
                          </span>
                        </div>
                        {poapHolders[poap.id] && (
                          <div className="flex items-center pt-1">
                            <Users className="mr-2 h-4 w-4 opacity-70" />
                            <span className="text-xs text-muted-foreground">
                              {poapHolders[poap.id].length} participantes
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Mobile Dialog for POAP Details */}
      {selectedPoap && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="absolute right-4 top-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full" 
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogTitle className="text-center">{selectedPoap.name}</DialogTitle>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 overflow-hidden">
                <img 
                  src={getPoapImageUrl(selectedPoap.id)} 
                  alt={selectedPoap.name}
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback for image loading errors with support for new POAPs
                    const poapIdNum = parseInt(selectedPoap.id);
                    let fallbackImg = "Placeholder";
                    
                    if (poapIdNum <= 5) {
                      // Original POAPs
                      fallbackImg = selectedPoap.id === "1" ? "2FXmoQu" : 
                                    selectedPoap.id === "2" ? "t8Vkz9d" : 
                                    selectedPoap.id === "3" ? "RGKxyD9" : 
                                    selectedPoap.id === "4" ? "UzsgKhq" : 
                                    selectedPoap.id === "5" ? "YTjYQK8" : "Placeholder";
                    } else {
                      // Real POAPs
                      fallbackImg = selectedPoap.id === "101" ? "Nbv3WrL" : 
                                    selectedPoap.id === "102" ? "m7xtXwG" : 
                                    selectedPoap.id === "103" ? "cH9V2Wk" : 
                                    selectedPoap.id === "104" ? "LDh7mXR" : 
                                    selectedPoap.id === "105" ? "3gXfTQM" : "Placeholder";
                    }
                    
                    e.currentTarget.src = `https://i.imgur.com/${fallbackImg}.png`;
                  }}
                />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-center">
                {selectedPoap.description}
              </p>
              <div className="flex items-center justify-center">
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  {new Date(selectedPoap.event.start_date).toLocaleDateString()} - {new Date(selectedPoap.event.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  {selectedPoap.event.city}, {selectedPoap.event.country}
                </span>
              </div>
              {poapHolders[selectedPoap.id] && (
                <div className="flex items-center justify-center">
                  <Users className="mr-2 h-4 w-4 opacity-70" />
                  <span className="text-xs text-muted-foreground">
                    {poapHolders[selectedPoap.id].length} participantes
                  </span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}