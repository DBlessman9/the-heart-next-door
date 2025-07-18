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
  const [hydration, setHydration] = useState<string>("");
  const [nutrition, setNutrition] = useState<string>("");
  const [restQuality, setRestQuality] = useState<number>(0);
  const [babyMovement, setBabyMovement] = useState<string>("");
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const { data: todaysCheckIn } = useQuery({
    queryKey: ["/api/checkin/today", userId],
  });

  const { data: randomAffirmation } = useQuery({
    queryKey: ["/api/affirmations/random"],
    queryFn: async () => {
      const stage = user.isPostpartum ? "postpartum" : user.pregnancyStage;
      const response = await fetch(`/api/affirmations/random?stage=${stage}`);
      return response.json();
    },
  });

  const createCheckInMutation = useMutation({
    mutationFn: async (checkInData: { energyLevel: number; mood: string; hydration: string; nutrition: string; restQuality: number; babyMovement: string }) => {
      const response = await apiRequest("POST", "/api/checkin", {
        userId,
        energyLevel: checkInData.energyLevel,
        mood: checkInData.mood,
        hydration: checkInData.hydration,
        nutrition: checkInData.nutrition,
        restQuality: checkInData.restQuality,
        babyMovement: checkInData.babyMovement,
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
      setHydration(todaysCheckIn.hydration || "");
      setNutrition(todaysCheckIn.nutrition || "");
      setRestQuality(todaysCheckIn.restQuality || 0);
      setBabyMovement(todaysCheckIn.babyMovement || "");
    }
  }, [todaysCheckIn]);

  const handleSubmitCheckIn = () => {
    const requiredFields = energyLevel > 0 && mood && hydration && nutrition && restQuality > 0;
    const babyMovementRequired = !user.isPostpartum && user.pregnancyWeek && user.pregnancyWeek >= 16;
    
    if (requiredFields && (!babyMovementRequired || babyMovement)) {
      createCheckInMutation.mutate({ energyLevel, mood, hydration, nutrition, restQuality, babyMovement });
    }
  };

  const moods = [
    { id: "peaceful", label: "Peaceful", selected: mood === "peaceful" },
    { id: "anxious", label: "Anxious", selected: mood === "anxious" },
    { id: "excited", label: "Excited", selected: mood === "excited" },
    { id: "tired", label: "Tired", selected: mood === "tired" },
  ];

  const hydrationOptions = [
    { id: "none", label: "None", selected: hydration === "none" },
    { id: "1-2", label: "1–2 cups", selected: hydration === "1-2" },
    { id: "3-5", label: "3–5", selected: hydration === "3-5" },
    { id: "6+", label: "6+", selected: hydration === "6+" },
  ];

  const nutritionOptions = [
    { id: "yes", label: "Yes", selected: nutrition === "yes" },
    { id: "not-yet", label: "Not yet", selected: nutrition === "not-yet" },
    { id: "trying", label: "I'm trying", selected: nutrition === "trying" },
  ];

  const babyMovementOptions = [
    { id: "yes", label: "Yes", selected: babyMovement === "yes" },
    { id: "not-yet", label: "Not yet", selected: babyMovement === "not-yet" },
    { id: "unsure", label: "Unsure", selected: babyMovement === "unsure" },
  ];

  return (
    <div className="px-6 py-6">
      {/* Today's Affirmation */}
      <Card className="shadow-lg mb-4">
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
        <h3 className="text-xl font-semibold text-deep-teal mb-2">How are you feeling today, mama?</h3>
        <p className="text-gray-600">
          {hasCheckedIn ? "Thank you for checking in today!" : "Your wellness matters. Let's take this moment for you."}
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

        {/* Water Intake */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">Water Intake</h4>
            <div className="grid grid-cols-2 gap-3">
              {hydrationOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !hasCheckedIn && setHydration(option.id)}
                  disabled={hasCheckedIn}
                  className="p-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: option.selected ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 96%)',
                    color: option.selected ? 'white' : 'hsl(0, 0%, 40%)',
                    border: 'none',
                    cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                    opacity: hasCheckedIn ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = option.selected ? 'hsl(146, 27%, 50%)' : 'hsl(0, 0%, 88%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = option.selected ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 96%)';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {hasCheckedIn && hydration && (
              <div className="mt-4 p-3 bg-sage/10 rounded-lg">
                <p className="text-sm text-sage font-medium">
                  {hydration === "none" ? "Let's grab a glass of water together 💧 You're doing great." :
                   hydration === "1-2" ? "Great start! Try to sip a bit more water throughout the day 💧" :
                   hydration === "3-5" ? "You're doing well with hydration! Keep it up 💧" :
                   "Amazing hydration! Your body and baby are thankful 💧✨"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nutrition */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">Nutrition</h4>
            <div className="grid grid-cols-3 gap-3">
              {nutritionOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !hasCheckedIn && setNutrition(option.id)}
                  disabled={hasCheckedIn}
                  className="p-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: option.selected ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 96%)',
                    color: option.selected ? 'white' : 'hsl(0, 0%, 40%)',
                    border: 'none',
                    cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                    opacity: hasCheckedIn ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = option.selected ? 'hsl(146, 27%, 50%)' : 'hsl(0, 0%, 88%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = option.selected ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 96%)';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {hasCheckedIn && nutrition && (
              <div className="mt-4 p-3 bg-sage/10 rounded-lg">
                <p className="text-sm text-sage font-medium">
                  {nutrition === "yes" ? "Amazing! Your body and baby are thankful 🌱" : 
                   nutrition === "not-yet" ? "No worries! Even a small snack counts. Try some nuts or fruit 🍎" :
                   "You're doing your best, and that's what matters. Every small step counts 💚"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rest & Sleep Quality */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">Sleep Quality</h4>
            <div className="flex space-x-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => !hasCheckedIn && setRestQuality(level)}
                  disabled={hasCheckedIn}
                  className="w-12 h-12 rounded-full font-semibold transition-transform hover:scale-105"
                  style={{
                    backgroundColor: restQuality === level ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 85%)',
                    color: restQuality === level ? 'white' : 'hsl(0, 0%, 40%)',
                    border: 'none',
                    cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                    opacity: hasCheckedIn ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = restQuality === level ? 'hsl(146, 27%, 50%)' : 'hsl(0, 0%, 78%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasCheckedIn) {
                      e.target.style.backgroundColor = restQuality === level ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 85%)';
                    }
                  }}
                >
                  {level === 1 ? '😴' : level === 5 ? '😊' : level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Exhausted</span>
              <span>Rested & Refreshed</span>
            </div>
            {hasCheckedIn && restQuality > 0 && (
              <div className="mt-4 p-3 bg-sage/10 rounded-lg">
                <p className="text-sm text-sage font-medium">
                  {restQuality <= 2 ? "Rest is so important, mama. Consider a short nap or gentle breathing exercise 🌙" :
                   restQuality >= 4 ? "Wonderful! You're taking great care of yourself ✨" :
                   "You're doing well. Remember, rest when you can - even 10 minutes helps 💤"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Baby Movement (if pregnant) */}
        {!user.isPostpartum && user.pregnancyWeek && user.pregnancyWeek >= 16 && (
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h4 className="font-semibold text-deep-teal mb-4">Baby Movement</h4>
              <div className="grid grid-cols-3 gap-3">
                {babyMovementOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => !hasCheckedIn && setBabyMovement(option.id)}
                    disabled={hasCheckedIn}
                    className="p-3 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: option.selected ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 96%)',
                      color: option.selected ? 'white' : 'hsl(0, 0%, 40%)',
                      border: 'none',
                      cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                      opacity: hasCheckedIn ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!hasCheckedIn) {
                        e.target.style.backgroundColor = option.selected ? 'hsl(146, 27%, 50%)' : 'hsl(0, 0%, 88%)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!hasCheckedIn) {
                        e.target.style.backgroundColor = option.selected ? 'hsl(146, 27%, 56%)' : 'hsl(0, 0%, 96%)';
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {hasCheckedIn && babyMovement && (
                <div className="mt-4 p-3 bg-sage/10 rounded-lg">
                  <p className="text-sm text-sage font-medium">
                    {babyMovement === "yes" ? "How wonderful! Those little kicks are such a blessing 👶✨" :
                     babyMovement === "not-yet" ? "That's okay! Every baby has their own rhythm. Try lying on your left side 💕" :
                     "It's normal to wonder sometimes. If you're concerned, trust your instincts and reach out to your provider 💙"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {!hasCheckedIn && (
          <button
            onClick={handleSubmitCheckIn}
            disabled={(() => {
              const requiredFields = !energyLevel || !mood || !hydration || !nutrition || !restQuality;
              const babyMovementRequired = !user.isPostpartum && user.pregnancyWeek && user.pregnancyWeek >= 16 && !babyMovement;
              return requiredFields || babyMovementRequired || createCheckInMutation.isPending;
            })()}
            className="w-full py-3 rounded-2xl font-semibold transition-colors"
            style={{
              backgroundColor: 'hsl(146, 27%, 56%)',
              color: 'white',
              border: 'none',
              cursor: (() => {
                const requiredFields = !energyLevel || !mood || !hydration || !nutrition || !restQuality;
                const babyMovementRequired = !user.isPostpartum && user.pregnancyWeek && user.pregnancyWeek >= 16 && !babyMovement;
                return requiredFields || babyMovementRequired || createCheckInMutation.isPending ? 'not-allowed' : 'pointer';
              })(),
              opacity: (() => {
                const requiredFields = !energyLevel || !mood || !hydration || !nutrition || !restQuality;
                const babyMovementRequired = !user.isPostpartum && user.pregnancyWeek && user.pregnancyWeek >= 16 && !babyMovement;
                return requiredFields || babyMovementRequired || createCheckInMutation.isPending ? 0.5 : 1;
              })()
            }}
            onMouseEnter={(e) => {
              const requiredFields = energyLevel && mood && hydration && nutrition && restQuality;
              const babyMovementOk = user.isPostpartum || !user.pregnancyWeek || user.pregnancyWeek < 16 || babyMovement;
              if (requiredFields && babyMovementOk && !createCheckInMutation.isPending) {
                e.target.style.backgroundColor = 'hsl(146, 27%, 50%)';
              }
            }}
            onMouseLeave={(e) => {
              const requiredFields = energyLevel && mood && hydration && nutrition && restQuality;
              const babyMovementOk = user.isPostpartum || !user.pregnancyWeek || user.pregnancyWeek < 16 || babyMovement;
              if (requiredFields && babyMovementOk && !createCheckInMutation.isPending) {
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
