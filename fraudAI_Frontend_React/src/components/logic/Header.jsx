import { Search, Bell, CreditCard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarContent from "./SidebarContent";

const Header = ({ user }) => {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-xl bg-black/20 border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 p-0 bg-[#0f172a] border-r border-white/10"
            >
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center md:hidden">
            <CreditCard className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold text-blue-400">
              SafeUPI
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Quick search..."
              className="pl-9 w-64 bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:bg-white/10"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src={user?.photoURL} alt="User" />
            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
