import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Activity, Baby } from "lucide-react";
import { format } from "date-fns";

interface PartnerDashboardProps {
  userId: number;
}

export default function PartnerDashboard({ userId }: PartnerDashboardProps) {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/partner/dashboard", userId],
    queryFn: async () => {
      const response = await fetch(`/api/partner/dashboard/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blush/5 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blush/5 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">No partnership found. Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  const { mother, partnership, recentCheckIns, upcomingAppointments } = dashboardData;

  // Calculate pregnancy progress
  const pregnancyWeek = mother.pregnancyWeek || 0;
  const weeksRemaining = Math.max(0, 40 - pregnancyWeek);

  // Baby size comparison (simplified)
  const getBabySize = (week: number) => {
    if (week < 8) return "Raspberry";
    if (week < 12) return "Lime";
    if (week < 16) return "Avocado";
    if (week < 20) return "Banana";
    if (week < 24) return "Papaya";
    if (week < 28) return "Eggplant";
    if (week < 32) return "Pineapple";
    if (week < 36) return "Honeydew";
    return "Watermelon";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blush/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-white border-4 border-pink-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Heart className="text-red-500 fill-red-500" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-deep-teal mb-2" data-testid="text-partner-header">
            Supporting {mother.firstName}
          </h1>
          <p className="text-gray-600">
            Here's what's happening on her journey
          </p>
        </div>

        {/* Baby Development Card */}
        <Card data-testid="card-baby-development">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-deep-teal">
              <Baby size={24} />
              Baby's Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-deep-teal" data-testid="text-pregnancy-week">
                    Week {pregnancyWeek}
                  </p>
                  <p className="text-sm text-gray-600">
                    {weeksRemaining} weeks to go
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blush" data-testid="text-baby-size">
                    Size of a {getBabySize(pregnancyWeek)}
                  </p>
                </div>
              </div>
              {mother.dueDate && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Due date: <span className="font-semibold text-deep-teal" data-testid="text-due-date">
                      {format(new Date(mother.dueDate), "MMMM d, yyyy")}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins Card */}
        {partnership.canViewCheckIns && (
          <Card data-testid="card-recent-checkins">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-deep-teal">
                <Activity size={24} />
                Recent Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCheckIns.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No check-ins yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentCheckIns.map((checkIn: any, index: number) => (
                    <div 
                      key={checkIn.id} 
                      className="border-l-4 border-blush pl-4 py-2"
                      data-testid={`checkin-${index}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-deep-teal">
                          {checkIn.createdAt ? format(new Date(checkIn.createdAt), "MMMM d") : "Recent"}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm">
                        {checkIn.feeling && (
                          <p className="text-gray-700">
                            Feeling: <span className="font-medium">{checkIn.feeling}</span>
                          </p>
                        )}
                        {checkIn.bodyCare && (
                          <p className="text-gray-700">
                            Self-care: <span className="font-medium">{checkIn.bodyCare}</span>
                          </p>
                        )}
                        {checkIn.feelingSupported && (
                          <p className="text-gray-700">
                            Support level: <span className="font-medium">{checkIn.feelingSupported}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Appointments Card */}
        {partnership.canViewAppointments && (
          <Card data-testid="card-upcoming-appointments">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-deep-teal">
                <Calendar size={24} />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No upcoming appointments
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment: any, index: number) => (
                    <div 
                      key={appointment.id}
                      className="flex items-start gap-4 p-4 bg-blush/5 rounded-lg"
                      data-testid={`appointment-${index}`}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-blush/20 rounded-full flex items-center justify-center">
                        <Calendar size={20} className="text-blush" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-deep-teal" data-testid={`appointment-title-${index}`}>
                          {appointment.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(appointment.dateTime), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                        {appointment.location && (
                          <p className="text-sm text-gray-600 mt-1">
                            📍 {appointment.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Support Tips Card */}
        <Card data-testid="card-support-tips">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-deep-teal">
              <Heart size={24} />
              Ways to Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-blush text-lg">💚</span>
                <p>Ask how she's feeling today and really listen to her response</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blush text-lg">🍽️</span>
                <p>Prepare her favorite healthy meal or snack</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blush text-lg">🛁</span>
                <p>Help create a relaxing environment for her to rest</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blush text-lg">📅</span>
                <p>Offer to attend appointments together</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
