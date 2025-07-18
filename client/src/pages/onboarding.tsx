import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pregnancyWeek: "",
    pregnancyStage: "",
    dueDate: "",
    isPostpartum: false,
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest("POST", "/api/users", {
        ...userData,
        pregnancyWeek: parseInt(userData.pregnancyWeek) || null,
        dueDate: userData.dueDate ? new Date(userData.dueDate) : null,
      });
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUserId", user.id.toString());
      toast({
        title: "Welcome to your digital village!",
        description: "Your profile has been created successfully.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error creating profile",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-6">
        {step === 1 && (
          <div className="text-center mt-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-sage to-lavender rounded-full flex items-center justify-center mb-6">
              <Heart className="text-white text-4xl" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-deep-teal mb-4">
              Welcome to Your Digital Village
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Meet Nia, your AI-powered doula who's here to support you 24/7 through your pregnancy and postpartum journey.
            </p>
            <div className="space-y-4 px-4">
              <Button 
                onClick={() => setStep(2)}
                className="w-full bg-sage text-white py-4 rounded-2xl text-lg hover:bg-sage/90 font-semibold shadow-lg"
              >
                Get Started
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Check if there's an existing user
                  const existingUserId = localStorage.getItem("currentUserId");
                  if (existingUserId) {
                    setLocation("/");
                  } else {
                    toast({
                      title: "No existing profile found",
                      description: "Please create a new profile to continue.",
                      variant: "destructive",
                    });
                  }
                }}
                className="w-full border-2 border-sage text-sage py-4 rounded-2xl text-lg hover:bg-sage hover:text-white font-semibold"
              >
                I'm Returning
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-deep-teal mb-6 text-center">
                Tell us about yourself
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pregnancyStage">Current Stage</Label>
                  <Select 
                    value={formData.pregnancyStage} 
                    onValueChange={(value) => handleInputChange("pregnancyStage", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your current stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First Trimester</SelectItem>
                      <SelectItem value="second">Second Trimester</SelectItem>
                      <SelectItem value="third">Third Trimester</SelectItem>
                      <SelectItem value="postpartum">Postpartum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-sage text-white py-3 rounded-2xl hover:bg-sage/90"
                  disabled={!formData.name || !formData.email || !formData.pregnancyStage}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-deep-teal mb-6 text-center">
                A few more details
              </h2>
              <div className="space-y-4">
                {formData.pregnancyStage !== "postpartum" && (
                  <>
                    <div>
                      <Label htmlFor="pregnancyWeek">Pregnancy Week (optional)</Label>
                      <Input
                        id="pregnancyWeek"
                        type="number"
                        value={formData.pregnancyWeek}
                        onChange={(e) => handleInputChange("pregnancyWeek", e.target.value)}
                        placeholder="e.g., 24"
                        className="mt-1"
                        min="1"
                        max="42"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date (optional)</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange("dueDate", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-sage text-white py-3 rounded-2xl hover:bg-sage/90"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? "Creating Profile..." : "Complete Setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
