import { useState, useEffect } from "react";
import { User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface AppHeaderProps {
  user: UserType;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

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

  return (
    <header className="bg-white shadow-sm px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-deep-teal">
            {getGreeting()}, {user.firstName} 💛
          </h2>
          <p className="text-sm text-gray-500">
            {getPregnancyInfo()}
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-coral to-muted-gold rounded-full flex items-center justify-center">
          <User className="text-white" size={20} />
        </div>
      </div>
    </header>
  );
}
