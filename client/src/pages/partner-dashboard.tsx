import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Calendar, BookOpen, TrendingUp, MessageCircle, Settings, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface PartnerInsight {
  date: string;
  feeling: string;
  bodyCare: string;
  feelingSupported: string;
  notes?: string;
}

interface PartnerResource {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  duration: string;
  isRequired: boolean;
  completed?: boolean;
}

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const currentUserId = localStorage.getItem("currentUserId");
  const partnerId = currentUserId ? parseInt(currentUserId) : null;

  // Get partner's associated mother and check-ins (when permissions allow)
  const { data: partnerInsights = [] } = useQuery<PartnerInsight[]>({
    queryKey: ["/api/partner/insights", partnerId],
    enabled: !!partnerId,
  });

  // Get partner-specific resources
  const { data: partnerResources = [] } = useQuery<PartnerResource[]>({
    queryKey: ["/api/partner-resources", selectedCategory === "all" ? undefined : selectedCategory],
    enabled: true,
  });

  // Get partner progress
  const { data: partnerProgress = [] } = useQuery({
    queryKey: ["/api/partner-progress", partnerId],
    enabled: !!partnerId,
  });

  const resourceCategories = [
    { value: "all", label: "All Resources" },
    { value: "understanding_pregnancy", label: "Understanding Pregnancy" },
    { value: "supporting_labor", label: "Supporting Labor" },
    { value: "communication", label: "Communication" },
    { value: "postpartum_support", label: "Postpartum Support" },
  ];

  const getMotivationalMessage = () => {
    const messages = [
      "Your support means everything to your partner right now.",
      "Being here shows how much you care. Thank you for showing up.",
      "Your involvement makes this journey stronger for both of you.",
      "Every resource you complete helps you be a better support partner.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const completedResources = partnerProgress.length;
  const totalRequiredResources = partnerResources.filter(r => r.isRequired).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sage-800">Partner Dashboard</h1>
              <p className="text-sage-600 mt-1">{getMotivationalMessage()}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/partner-settings")}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-sage-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sage-600">Resources Completed</p>
                  <p className="text-2xl font-bold text-sage-800">{completedResources}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-sage-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-sage-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sage-600">Learning Progress</p>
                  <p className="text-2xl font-bold text-sage-800">
                    {totalRequiredResources > 0 ? Math.round((completedResources / totalRequiredResources) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-sage-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-sage-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sage-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-sage-800">3</p>
                </div>
                <Calendar className="w-8 h-8 text-sage-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-sage-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sage-600">Connection</p>
                  <p className="text-2xl font-bold text-sage-800">Strong</p>
                </div>
                <Heart className="w-8 h-8 text-sage-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partner Learning Resources */}
          <Card className="bg-white border-sage-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Resources
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {resourceCategories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className={selectedCategory === category.value ? "bg-sage-600 hover:bg-sage-700" : ""}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {partnerResources.map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4 hover:bg-sage-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sage-800">{resource.title}</h4>
                        {resource.isRequired && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                        {resource.completed && (
                          <CheckCircle2 size={16} className="text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-sage-600 mb-2">{resource.description}</p>
                      <div className="flex items-center gap-4 text-xs text-sage-500">
                        <span>{resource.type}</span>
                        <span>{resource.duration}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {resource.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Partner Support Insights */}
          <Card className="bg-white border-sage-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Support Insights
              </CardTitle>
              <p className="text-sm text-sage-600">
                Understanding how your partner is feeling
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-sage-50 rounded-lg p-4">
                <h4 className="font-medium text-sage-800 mb-2">How to be supportive today:</h4>
                <ul className="text-sm text-sage-600 space-y-1">
                  <li>• Ask how she's feeling and really listen</li>
                  <li>• Offer to help with daily tasks</li>
                  <li>• Acknowledge her efforts and strength</li>
                  <li>• Plan something special together</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sage-800 mb-3">Recent Check-ins</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {partnerInsights.length > 0 ? (
                    partnerInsights.slice(0, 5).map((insight, index) => (
                      <div key={index} className="border-l-4 border-sage-300 pl-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-sage-700">
                            {new Date(insight.date).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {insight.feeling}
                          </Badge>
                        </div>
                        <p className="text-xs text-sage-600">
                          Feeling: {insight.feeling} • Body care: {insight.bodyCare}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-sage-300 mx-auto mb-2" />
                      <p className="text-sm text-sage-500">
                        No insights available yet. Ask your partner to enable sharing in settings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="bg-white border-sage-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sage-800">20-Week Anatomy Scan</h4>
                  <Badge>Upcoming</Badge>
                </div>
                <p className="text-sm text-sage-600 mb-1">July 25, 2025 at 10:00 AM</p>
                <p className="text-xs text-sage-500">Women's Health Center, Room 201</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sage-800">Monthly Check-up</h4>
                  <Badge variant="outline">Routine</Badge>
                </div>
                <p className="text-sm text-sage-600 mb-1">August 1, 2025 at 2:00 PM</p>
                <p className="text-xs text-sage-500">Dr. Rodriguez's Office</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sage-800">Childbirth Class</h4>
                  <Badge variant="secondary">Educational</Badge>
                </div>
                <p className="text-sm text-sage-600 mb-1">August 5, 2025 at 6:00 PM</p>
                <p className="text-xs text-sage-500">Community Health Center</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}