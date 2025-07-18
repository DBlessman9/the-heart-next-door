import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Video, FileText, BookOpen } from "lucide-react";
import type { User, Resource } from "@shared/schema";

interface ResourcesProps {
  user: User;
}

export default function Resources({ user }: ResourcesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: stageResources = [] } = useQuery({
    queryKey: ["/api/resources"],
    queryFn: async () => {
      const response = await fetch(`/api/resources?stage=${user.pregnancyStage}`);
      return response.json();
    },
  });

  const { data: popularResources = [] } = useQuery({
    queryKey: ["/api/resources", "popular"],
    queryFn: async () => {
      const response = await fetch("/api/resources?popular=true");
      return response.json();
    },
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "article":
        return FileText;
      case "guide":
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getResourceBgColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-gradient-to-br from-sage to-deep-teal";
      case "article":
        return "bg-gradient-to-br from-coral to-muted-gold";
      case "guide":
        return "bg-gradient-to-br from-lavender to-sage";
      default:
        return "bg-gradient-to-br from-sage to-deep-teal";
    }
  };

  const categories = [
    { id: "sleep", label: "Sleep Tips", color: "hsl(146, 27%, 56%)" },
    { id: "exercise", label: "Exercise", color: "hsl(264, 56%, 77%)" },
    { id: "nutrition", label: "Baby Care", color: "hsl(10, 73%, 70%)" },
    { id: "breastfeeding", label: "Breastfeeding", color: "hsl(39, 75%, 74%)" },
  ];

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-deep-teal">Learning Hub</h3>
        <Button variant="ghost" size="sm">
          <Search size={20} className="text-sage" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* For Your Stage */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-3">For Your Stage</h4>
            <p className="text-sm text-gray-600 mb-4">
              {user.pregnancyWeek ? `Week ${user.pregnancyWeek}` : ""} • {user.pregnancyStage ? `${user.pregnancyStage.charAt(0).toUpperCase()}${user.pregnancyStage.slice(1)} Trimester` : "Your Journey"}
            </p>
            <div className="space-y-3">
              {stageResources.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No resources available for your current stage</p>
                </div>
              ) : (
                stageResources.map((resource: Resource) => {
                  const Icon = getResourceIcon(resource.type);
                  return (
                    <div
                      key={resource.id}
                      className="flex items-center space-x-3 p-3 bg-warm-gray rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <div className={`w-12 h-12 ${getResourceBgColor(resource.type)} rounded-xl flex items-center justify-center`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-deep-teal">{resource.title}</h5>
                        <p className="text-sm text-gray-600">{resource.duration}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Topics */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">Popular Topics</h4>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="p-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: category.color,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: selectedCategory === category.id ? 1 : 0.8
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = selectedCategory === category.id ? '1' : '0.8';
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Resources */}
        {popularResources.length > 0 && (
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h4 className="font-semibold text-deep-teal mb-4">Popular Resources</h4>
              <div className="space-y-3">
                {popularResources.map((resource: Resource) => {
                  const Icon = getResourceIcon(resource.type);
                  return (
                    <div
                      key={resource.id}
                      className="flex items-center space-x-3 p-3 bg-warm-gray rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <div className={`w-12 h-12 ${getResourceBgColor(resource.type)} rounded-xl flex items-center justify-center`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-deep-teal">{resource.title}</h5>
                        <p className="text-sm text-gray-600">{resource.duration}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
