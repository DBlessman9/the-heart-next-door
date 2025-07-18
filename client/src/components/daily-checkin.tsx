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
  const [feeling, setFeeling] = useState<string>("");
  const [bodyCare, setBodyCare] = useState<string>("");
  const [feelingSupported, setFeelingSupported] = useState<string>("");
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
    mutationFn: async (checkInData: { feeling: string; bodyCare: string; feelingSupported: string }) => {
      const response = await apiRequest("POST", "/api/checkin", {
        userId,
        feeling: checkInData.feeling,
        bodyCare: checkInData.bodyCare,
        feelingSupported: checkInData.feelingSupported,
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
      setFeeling(todaysCheckIn.feeling || "");
      setBodyCare(todaysCheckIn.bodyCare || "");
      setFeelingSupported(todaysCheckIn.feelingSupported || "");
    }
  }, [todaysCheckIn]);

  const handleSubmitCheckIn = () => {
    if (feeling && bodyCare && feelingSupported) {
      createCheckInMutation.mutate({ feeling, bodyCare, feelingSupported });
    }
  };

  const feelingOptions = [
    { id: "peaceful", label: "Peaceful", selected: feeling === "peaceful" },
    { id: "anxious", label: "Anxious", selected: feeling === "anxious" },
    { id: "tired", label: "Tired", selected: feeling === "tired" },
    { id: "overwhelmed", label: "Overwhelmed", selected: feeling === "overwhelmed" },
    { id: "grateful", label: "Grateful", selected: feeling === "grateful" },
    { id: "other", label: "Other", selected: feeling === "other" },
  ];

  const bodyCareOptions = [
    { id: "not-yet", label: "Not yet", selected: bodyCare === "not-yet" },
    { id: "a-little", label: "A little", selected: bodyCare === "a-little" },
    { id: "yes-tried", label: "Yes, I tried", selected: bodyCare === "yes-tried" },
    { id: "yes-nourished", label: "Yes, feeling nourished", selected: bodyCare === "yes-nourished" },
  ];

  const supportOptions = [
    { id: "not-really", label: "Not really", selected: feelingSupported === "not-really" },
    { id: "a-little", label: "A little", selected: feelingSupported === "a-little" },
    { id: "mostly", label: "Mostly", selected: feelingSupported === "mostly" },
    { id: "fully-supported", label: "Fully supported", selected: feelingSupported === "fully-supported" },
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
        {/* Question 1: How are you feeling today? */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">1. How are you feeling today?</h4>
            <div className="grid grid-cols-2 gap-3">
              {feelingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !hasCheckedIn && setFeeling(option.id)}
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
            {hasCheckedIn && feeling && (
              <div className="mt-4 p-3 bg-sage/10 rounded-lg">
                <p className="text-sm text-sage font-medium">
                  {feeling === "peaceful" ? "What a beautiful feeling to hold today. You're doing wonderfully." :
                   feeling === "anxious" ? "It's okay to feel anxious. You're supported and not alone in this journey." :
                   feeling === "tired" ? "Rest when you can, mama. Your body is doing incredible work." :
                   feeling === "overwhelmed" ? "Take it one breath at a time. You're stronger than you know." :
                   feeling === "grateful" ? "Gratitude is such a powerful feeling. You're radiating positivity." :
                   "Every feeling is valid. You're doing an amazing job."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question 2: Have you cared for your body today? */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">2. Have you cared for your body today?</h4>
            <div className="grid grid-cols-2 gap-3">
              {bodyCareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !hasCheckedIn && setBodyCare(option.id)}
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
            {hasCheckedIn && bodyCare && (
              <div className="mt-4 p-3 bg-sage/10 rounded-lg">
                <p className="text-sm text-sage font-medium">
                  {bodyCare === "not-yet" ? "No pressure, mama. Even small acts of self-care count. Maybe start with a glass of water?" :
                   bodyCare === "a-little" ? "Every little bit counts. You're taking steps to care for yourself." :
                   bodyCare === "yes-tried" ? "You're making an effort and that's what matters. Keep going!" :
                   "Beautiful! Your body and baby are grateful for the nourishment you're giving them."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question 3: Do you feel supported right now? */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">3. Do you feel supported right now?</h4>
            <div className="grid grid-cols-2 gap-3">
              {supportOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !hasCheckedIn && setFeelingSupported(option.id)}
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
            {hasCheckedIn && feelingSupported && (
              <div className="mt-4 p-3 bg-sage/10 rounded-lg">
                <p className="text-sm text-sage font-medium">
                  {feelingSupported === "not-really" ? "You're not alone, even when it feels that way. Consider reaching out to someone today." :
                   feelingSupported === "a-little" ? "It's okay to need more support. You deserve to feel surrounded by care." :
                   feelingSupported === "mostly" ? "It's wonderful that you feel supported. That makes such a difference." :
                   "How beautiful to feel fully supported! You're surrounded by love."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          {!hasCheckedIn ? (
            <Button
              onClick={handleSubmitCheckIn}
              disabled={!feeling || !bodyCare || !feelingSupported || createCheckInMutation.isPending}
              className="w-full bg-gradient-to-r from-coral to-muted-gold text-white py-4 text-lg font-medium hover:from-coral/90 hover:to-muted-gold/90 transition-all duration-200 disabled:opacity-50"
            >
              {createCheckInMutation.isPending ? "Checking in..." : "Complete Check-In"}
            </Button>
          ) : (
            <div className="bg-sage/10 rounded-lg p-4">
              <p className="text-sage font-medium">
                Thank you for taking time to check in with yourself today, mama. 
                Remember, you're doing an amazing job. 💚
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}