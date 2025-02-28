"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CalendarDays, MapPin } from "lucide-react";
import { type POAP } from "@/lib/utils";

export function PoapDisplay({ poaps }: { poaps: POAP[] }) {
  if (!poaps || poaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 border rounded-lg border-dashed">
        <p className="text-muted-foreground">No POAPs found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-60">
      <div className="flex flex-wrap gap-3 p-1">
        {poaps.map((poap) => (
          <HoverCard key={poap.id}>
            <HoverCardTrigger asChild>
              <Card className="w-[90px] h-[90px] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all">
                <CardContent className="p-2 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mb-1 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">POAP</span>
                  </div>
                  <p className="text-xs truncate">{poap.name}</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex-shrink-0 flex items-center justify-center">
                  <span className="text-white font-medium">POAP</span>
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
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </ScrollArea>
  );
}