import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Users, 
  Heart,
  Baby,
  Home,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  Award,
  User
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

interface DashboardProps {
  userId: number;
}

export default function InsightsDashboard({ userId }: DashboardProps) {
  // Fetch user data
  const { data: user } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  // Fetch check-in trends (last 7 days)
  const { data: checkinTrends } = useQuery({
    queryKey: [`/api/checkins/trends/${userId}`],
  });

  // Fetch journal entries for streak calculation
  const { data: journalEntries } = useQuery({
    queryKey: [`/api/journal/${userId}`],
  });

  // Fetch upcoming appointments
  const { data: appointments } = useQuery({
    queryKey: [`/api/appointments/${userId}`],
  });

  // Fetch completed resources
  const { data: completedResources } = useQuery({
    queryKey: [`/api/resources/completed/${userId}`],
  });

  // Fetch support team/experts
  const { data: supportTeam } = useQuery({
    queryKey: [`/api/experts`],
  });

  // Calculate journal streak
  const calculateJournalStreak = () => {
    if (!journalEntries || journalEntries.length === 0) return 0;
    
    try {
      const sortedEntries = journalEntries
        .filter((entry: any) => entry.createdAt) // Filter out entries without dates
        .map((entry: any) => new Date(entry.createdAt))
        .filter((date: Date) => !isNaN(date.getTime())) // Filter out invalid dates
        .sort((a: Date, b: Date) => b.getTime() - a.getTime());
      
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (const entryDate of sortedEntries) {
        const entryDay = new Date(entryDate);
        entryDay.setHours(0, 0, 0, 0);
        
        if (entryDay.getTime() === currentDate.getTime()) {
          streak++;
          currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        } else if (entryDay.getTime() === currentDate.getTime() - 24 * 60 * 60 * 1000) {
          streak++;
          currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating journal streak:', error);
      return 0;
    }
  };

  // Calculate completion percentage for learning modules
  const calculateLearningProgress = () => {
    if (!completedResources) return 0;
    const totalModules = 25; // Assume 25 total learning modules
    return Math.min((completedResources.length / totalModules) * 100, 100);
  };

  // Get recent mood trend
  const getMoodTrend = () => {
    if (!checkinTrends || checkinTrends.length < 2) return "stable";
    try {
      const recent = checkinTrends.slice(-2);
      const moodScore = (feeling: string) => {
        const scores: { [key: string]: number } = {
          'Peaceful': 5, 'Grateful': 5, 'Yes, feeling nourished': 4,
          'A little': 3, 'Tired': 2, 'Anxious': 1, 'Overwhelmed': 1
        };
        return scores[feeling] || 3;
      };
      
      const currentScore = moodScore(recent[1]?.feeling || '');
      const previousScore = moodScore(recent[0]?.feeling || '');
      
      if (currentScore > previousScore) return "improving";
      if (currentScore < previousScore) return "declining";
      return "stable";
    } catch (error) {
      console.error('Error calculating mood trend:', error);
      return "stable";
    }
  };

  const journalStreak = calculateJournalStreak();
  const learningProgress = calculateLearningProgress();
  const moodTrend = getMoodTrend();
  const upcomingAppointments = appointments?.filter((apt: any) => {
    try {
      return apt.date && isAfter(new Date(apt.date), new Date());
    } catch (error) {
      return false;
    }
  }).slice(0, 3) || [];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Your Journey Insights</h1>
        <p className="text-gray-600">Track your wellness progress and celebrate your growth</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Journal Streak */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{journalStreak}</div>
            <p className="text-xs text-gray-600">Day Streak</p>
          </CardContent>
        </Card>

        {/* Week Progress */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Baby className="h-8 w-8 text-sage" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{user?.pregnancyWeek || 0}</div>
            <p className="text-xs text-gray-600">Weeks</p>
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(learningProgress)}%</div>
            <p className="text-xs text-gray-600">Learning</p>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className={`h-8 w-8 ${
                moodTrend === 'improving' ? 'text-green-500' : 
                moodTrend === 'declining' ? 'text-red-500' : 'text-yellow-500'
              }`} />
            </div>
            <div className="text-sm font-bold text-gray-900 capitalize">{moodTrend}</div>
            <p className="text-xs text-gray-600">Mood Trend</p>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Check-in Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-sage" />
            Emotional Check-in Trends
          </CardTitle>
          <CardDescription>Your feelings over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          {checkinTrends && checkinTrends.length > 0 ? (
            <div className="space-y-3">
              {checkinTrends.slice(-7).map((checkin: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {checkin.date ? format(new Date(checkin.date), 'MMM dd') : 'Recent'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      checkin.feeling === 'Peaceful' || checkin.feeling === 'Grateful' ? 'default' :
                      checkin.feeling === 'Tired' ? 'secondary' : 'outline'
                    }>
                      {checkin.feeling}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Start checking in daily to see your trends</p>
          )}
        </CardContent>
      </Card>

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sage" />
            Learning Journey
          </CardTitle>
          <CardDescription>Your progress through our educational content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Modules Completed</span>
                <span>{completedResources?.length || 0}/25</span>
              </div>
              <Progress value={learningProgress} className="h-2" />
            </div>
            
            {completedResources && completedResources.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Completions:</h4>
                {completedResources.slice(-3).map((resource: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">{resource.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sage" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>Your scheduled check-ups and consultations</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{appointment.title}</p>
                    <p className="text-xs text-gray-600">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {appointment.date ? format(new Date(appointment.date), 'MMM dd') : 'TBD'}
                    </p>
                    <p className="text-xs text-gray-600">{appointment.time || 'Time TBD'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No upcoming appointments</p>
              <Button variant="outline" size="sm" className="mt-2">
                Schedule Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sage" />
            Your Village Team
          </CardTitle>
          <CardDescription>The experts supporting your journey</CardDescription>
        </CardHeader>
        <CardContent>
          {supportTeam && supportTeam.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {supportTeam.slice(0, 4).map((expert: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 bg-sage rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{expert.name}</p>
                    <p className="text-xs text-gray-600">{expert.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Build your support team by connecting with experts</p>
          )}
        </CardContent>
      </Card>

      {/* Optional Tools Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-sage" />
            Planning Tools
          </CardTitle>
          <CardDescription>Helpful tools for your journey ahead</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Baby className="h-6 w-6" />
              <span className="text-sm">Baby Names</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Birth Plan</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Home className="h-6 w-6" />
              <span className="text-sm">Nursery Checklist</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}