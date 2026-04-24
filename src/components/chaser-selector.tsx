"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Responder {
  _id: string;
  name?: string;
  avatarUrl?: string;
}

interface ChaserSelectorProps {
  responders: Responder[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

export function ChaserSelector({
  responders,
  selectedId,
  onSelect,
}: ChaserSelectorProps) {
  const currentId = selectedId || responders[0]?._id;
  const selected = responders.find((r) => r._id === currentId);

  if (!responders.length) return null;

  return (
    <Select value={currentId} onValueChange={onSelect}>
      <SelectTrigger className="w-full h-fit py-4">
        <SelectValue>
          {selected && (
            <div className="flex items-center gap-4 px-4">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={selected.avatarUrl} />
                <AvatarFallback className="text-lg">
                  {selected.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-base">{selected.name || "Unknown"}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {responders.map((r) => (
          <SelectItem key={r._id} value={r._id} className="h-16 py-3">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={r.avatarUrl} />
                <AvatarFallback className="text-lg">{r.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <span className="text-base">{r.name || "Unknown"}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
