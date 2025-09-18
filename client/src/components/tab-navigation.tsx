import { MessageCircle, Heart, UserCheck, Baby, Calendar, Users, BarChart3 } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "checkin", label: "Check-in", icon: Heart },
    { id: "baby", label: "Baby", icon: Baby },
    { id: "insights", label: "Insights", icon: BarChart3 },
    { id: "appointments", label: "Schedule", icon: Calendar },
    { id: "community", label: "Village", icon: Users },
    { id: "experts", label: "Experts", icon: UserCheck },
  ];

  return (
    <nav className="bg-white border-t border-gray-100 sticky top-0 z-10">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-4 text-center border-b-2 transition-colors ${
                isActive
                  ? "border-sage text-sage"
                  : "border-transparent text-gray-400 hover:text-sage"
              }`}
            >
              <Icon size={20} className="mx-auto mb-1" />
              <p className="text-xs font-medium">{tab.label}</p>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
