import { MessageCircle, Heart, BookOpen, GraduationCap, UserCheck } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "checkin", label: "Check-in", icon: Heart },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "resources", label: "Learn", icon: GraduationCap },
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
