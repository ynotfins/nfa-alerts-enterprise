import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useChasers } from "@/hooks/use-profiles";
import { useAuthContext } from "@/contexts/auth-context";
import {
  getOrCreateDirectThread,
  getOrCreateChaserSupesThread,
} from "@/services/chat";

export function ChaserSearchDrawer() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const { chasers, loading } = useChasers();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingThread, setCreatingThread] = useState<string | null>(null);

  const isSupe = profile?.role === "supe" || profile?.role === "admin";

  const filteredChasers = chasers.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleChaserClick = async (chaserId: string) => {
    setCreatingThread(chaserId);
    try {
      const thread = isSupe
        ? await getOrCreateChaserSupesThread(chaserId)
        : await getOrCreateDirectThread(chaserId);
      if (thread._id) {
        setIsOpen(false);
        setTimeout(() => router.push(`/chat/${thread._id}`), 150);
      }
    } catch (error) {
      toast.error("Failed to create thread");
    } finally {
      setCreatingThread(null);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-full">
          <Plus className="size-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Start Conversation</DrawerTitle>
          <DrawerDescription>Search for chasers to message</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search chasers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <div className="space-y-2">
            {filteredChasers.map((chaser) => (
              <button
                key={chaser._id}
                onClick={() => handleChaserClick(chaser._id)}
                disabled={creatingThread === chaser._id}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={chaser.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {chaser.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium">{chaser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {chaser.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full h-11">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
