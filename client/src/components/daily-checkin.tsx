import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { User, CheckIn } from "@shared/schema";

interface DailyCheckInProps {
  userId: number;
  user: User;
}

export default function DailyCheckIn({ userId, user }: DailyCheckInProps) {
  const [energyLevel, setEnergyLevel] = useState<number>(0);
  const [mood, setMood] = useState<string>("");
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const { data: todaysCheckIn } = useQuery({
    queryKey: ["/api/checkin/today", userId],
  });

  const { data: randomAffirmation } = useQuery({
    queryKey: ["/api/affirmations/random"],
    queryFn: async () => {
      const response = await fetch(`/api/affirmations/random?stage=${user.pregnancyStage}`);
      return response.json();
    },
  });

  const createCheckInMutation = useMutation({
    mutationFn: async (checkInData: { energyLevel: number; mood: string }) => {
      const response = await apiRequest("POST", "/api/checkin", {
        userId,
        energyLevel: checkInData.energyLevel,
        mood: checkInData.mood,
        pregnancyWeek: user.pregnancyWeek,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkin/today", userId] });
      setHasCheckedIn(true);
    },
  });

  useEffect(() => {
    if (todaysCheckIn) {
      setHasCheckedIn(true);
      setEnergyLevel(todaysCheckIn.energyLevel || 0);
      setMood(todaysCheckIn.mood || "");
    }
  }, [todaysCheckIn]);

  const handleSubmitCheckIn = () => {
    if (energyLevel > 0 && mood) {
      createCheckInMutation.mutate({ energyLevel, mood });
    }
  };

  const moods = [
    { id: "peaceful", label: "Peaceful", selected: mood === "peaceful" },
    { id: "anxious", label: "Anxious", selected: mood === "anxious" },
    { id: "excited", label: "Excited", selected: mood === "excited" },
    { id: "tired", label: "Tired", selected: mood === "tired" },
  ];

  return (
    <div className="px-6 py-6">
      {/* Today's Affirmation */}
      <Card className="shadow-lg mb-6">
        <CardContent className="p-6">
          <h4 className="font-semibold text-deep-teal mb-4">Today's Affirmation</h4>
          <div className="bg-lavender rounded-xl p-4 text-center">
            <p className="text-deep-teal font-medium">
              {randomAffirmation?.content || "I am strong, capable, and surrounded by love. My body knows how to nurture and protect my baby."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-coral to-muted-gold rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="text-white" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-deep-teal mb-2">Daily Check-in</h3>
        <p className="text-gray-600">
          {hasCheckedIn ? "Thank you for checking in today!" : "How are you feeling today? Your wellness matters."}
        </p>
      </div>

      <div className="space-y-6">

        {/* Energy Level */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">Energy Level</h4>
            <div className="flex space-x-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => !hasCheckedIn && setEnergyLevel(level)}
                  disabled={hasCheckedIn}
                  className="w-12 h-12 rounded-full font-semibold transition-transform hover:scale-105"
                  style={{
                    backgroundColor: energyLevel === level ? 'hsl(10, 73%, 70%)' : 'hsl(0, 0%, 85%)',
                    color: energyLevel === level ? 'white' : 'hsl(0, 0%, 40%)',
                    border: 'none',
                    cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                    opacity: hasCheckedIn ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = energyLevel === level ? 'hsl(10, 73%, 65%)' : 'hsl(0, 0%, 78%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = energyLevel === level ? 'hsl(10, 73%, 70%)' : 'hsl(0, 0%, 85%)';
                    }
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">Mood Today</h4>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.id}
                  onClick={() => !hasCheckedIn && setMood(moodOption.id)}
                  disabled={hasCheckedIn}
                  className="p-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: moodOption.selected ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 96%)',
                    color: moodOption.selected ? 'white' : 'hsl(0, 0%, 40%)',
                    border: 'none',
                    cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                    opacity: hasCheckedIn ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = moodOption.selected ? 'hsl(146, 27%, 50%)' : 'hsl(0, 0%, 88%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = moodOption.selected ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 96%)';
                    }
                  }}
                >
                  {moodOption.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {!hasCheckedIn && (
          <button
            onClick={handleSubmitCheckIn}
            disabled={!energyLevel || !mood || createCheckInMutation.isPending}
            className="w-full py-3 rounded-2xl font-semibold transition-colors"
            style={{
              backgroundColor: 'hsl(146, 27%, 56%)',
              color: 'white',
              border: 'none',
              cursor: (!energyLevel || !mood || createCheckInMutation.isPending) ? 'not-allowed' : 'pointer',
              opacity: (!energyLevel || !mood || createCheckInMutation.isPending) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (energyLevel && mood && !createCheckInMutation.isPending) {
                e.target.style.backgroundColor = 'hsl(146, 27%, 50%)';
              }
            }}
            onMouseLeave={(e) => {
              if (energyLevel && mood && !createCheckInMutation.isPending) {
                e.target.style.backgroundColor = 'hsl(146, 27%, 56%)';
              }
            }}
          >
            {createCheckInMutation.isPending ? "Saving..." : "Complete Check-in"}
          </button>
        )}

      </div>
    </div>
  );
}
