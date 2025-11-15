import { useState, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User as UserType } from "@shared/schema";

interface AppHeaderProps {
  user: UserType;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getPregnancyInfo = () => {
    if (user.isPostpartum) {
      return "Postpartum Journey";
    }
    if (user.pregnancyWeek && user.pregnancyStage) {
      const stages = {
        first: "1st Trimester",
        second: "2nd Trimester", 
        third: "3rd Trimester"
      };
      return `Week ${user.pregnancyWeek} • ${stages[user.pregnancyStage as keyof typeof stages]}`;
    }
    return "Your Journey";
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUserId");
    setLocation("/onboarding");
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-deep-teal">
            {getGreeting()}, {user.firstName} 💗
          </h2>
          <p className="text-sm text-gray-500">
            {getPregnancyInfo()}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-12 w-12 rounded-full bg-gradient-to-br from-coral to-muted-gold hover:from-coral/90 hover:to-muted-gold/90">
              <User className="text-white" size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
