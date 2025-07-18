import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/app-header";
import TabNavigation from "@/components/tab-navigation";
import ChatInterface from "@/components/chat-interface";
import DailyCheckIn from "@/components/daily-checkin";
import Journal from "@/components/journal";
import Resources from "@/components/resources";
import Experts from "@/components/experts";
import BabyGuidance from "@/components/baby-guidance";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("checkin");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (userId) {
      setCurrentUserId(parseInt(userId));
    } else {
      setLocation("/onboarding");
    }
  }, [setLocation]);

  const { data: user } = useQuery({
    queryKey: ["/api/users", currentUserId],
    enabled: !!currentUserId,
  });

  if (!currentUserId || !user) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-deep-teal">Loading your digital village...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <AppHeader user={user} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="pb-4">
        {activeTab === "chat" && <ChatInterface userId={currentUserId} />}
        {activeTab === "checkin" && <DailyCheckIn userId={currentUserId} user={user} />}
        {activeTab === "baby" && <BabyGuidance userId={currentUserId} user={user} />}
        {activeTab === "journal" && <Journal userId={currentUserId} user={user} />}
        {activeTab === "resources" && <Resources user={user} />}
        {activeTab === "experts" && <Experts />}
      </div>
    </div>
  );
}
