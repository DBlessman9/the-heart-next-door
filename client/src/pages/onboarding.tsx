import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    pregnancyWeek: "",
    pregnancyStage: "",
    dueDate: "",
    babyBirthDate: "",
    pregnancyExperience: [] as string[],
    birthExperience: [] as string[],
    supportNeeds: [] as string[],
    isPostpartum: false,
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest("POST", "/api/users", {
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        pregnancyStage: userData.pregnancyStage,
        pregnancyWeek: userData.pregnancyWeek ? parseInt(userData.pregnancyWeek) : undefined,
        dueDate: userData.dueDate || undefined,
        isPostpartum: userData.pregnancyStage === "postpartum",
        babyBirthDate: userData.babyBirthDate || undefined,
        pregnancyExperience: userData.pregnancyExperience,
        birthExperience: userData.birthExperience,
        supportNeeds: userData.supportNeeds,
        preferences: {},
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

  const validatePregnancyData = () => {
    const week = parseInt(formData.pregnancyWeek);
    const stage = formData.pregnancyStage;
    const dueDate = formData.dueDate;

    // Skip validation if no week or stage provided
    if (!week || !stage || stage === "postpartum") {
      return { isValid: true, error: "" };
    }

    // Check trimester-week alignment
    const trimesterRanges = {
      first: { min: 1, max: 12 },
      second: { min: 13, max: 27 },
      third: { min: 28, max: 42 }
    };

    const range = trimesterRanges[stage];
    if (!range) {
      return { isValid: true, error: "" };
    }

    if (week < range.min || week > range.max) {
      return {
        isValid: false,
        error: `Week ${week} doesn't match ${stage} trimester (weeks ${range.min}-${range.max})`
      };
    }

    // Check due date alignment if provided
    if (dueDate) {
      const today = new Date();
      const due = new Date(dueDate);
      const weeksFromToday = Math.ceil((due.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const expectedWeeksRemaining = 40 - week;
      
      // Allow 2 week variance for due date calculations
      if (Math.abs(weeksFromToday - expectedWeeksRemaining) > 2) {
        return {
          isValid: false,
          error: `Due date doesn't align with week ${week}. Expected around ${expectedWeeksRemaining} weeks from now, but due date is ${weeksFromToday} weeks away`
        };
      }
    }

    return { isValid: true, error: "" };
  };

  const handleSubmit = () => {
    if (step < 4) {
      if (step === 3) {
        // Validate pregnancy data before going to final step
        if (formData.pregnancyStage !== "postpartum") {
          const validation = validatePregnancyData();
          if (!validation.isValid) {
            toast({
              title: "Data Validation Error",
              description: validation.error,
              variant: "destructive",
            });
            return;
          }
        }
      }
      setStep(step + 1);
    } else {
      // Final submission
      createUserMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: 'pregnancyExperience' | 'birthExperience' | 'supportNeeds', option: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, option] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== option) };
      }
    });
  };

  const getTrimesterRange = (stage: string) => {
    switch (stage) {
      case "first": return "weeks 1-12";
      case "second": return "weeks 13-27";
      case "third": return "weeks 28-40+";
      default: return "";
    }
  };

  const getValidationMessage = () => {
    const validation = validatePregnancyData();
    if (!validation.isValid) {
      return validation.error;
    }
    return "";
  };

  const isFormValid = () => {
    if (step === 2) {
      return formData.firstName && formData.lastName && formData.email && formData.pregnancyStage;
    }
    if (step === 3) {
      if (formData.pregnancyStage === "postpartum") {
        // For postpartum: baby birth date is required
        return formData.babyBirthDate;
      } else {
        // For pregnant: pregnancy week and due date are required
        return formData.pregnancyWeek && formData.dueDate;
      }
    }
    return true;
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
              Welcome home, mama.
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You were never meant to do this alone.<br/>
              Your personalized care starts now — with 24/7 support, real experts, and the love you deserve.
            </p>
            <div className="space-y-4 px-4">
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl text-lg font-semibold shadow-lg transition-colors"
                style={{
                  backgroundColor: 'hsl(146, 27%, 56%)',
                  color: 'white',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'hsl(146, 27%, 50%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'hsl(146, 27%, 56%)';
                }}
              >
                Get Started
              </button>
              <button 
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
                className="w-full py-4 rounded-2xl text-lg font-semibold transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: 'hsl(146, 27%, 56%)',
                  border: '2px solid hsl(146, 27%, 56%)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'hsl(146, 27%, 56%)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'hsl(146, 27%, 56%)';
                }}
              >
                I'm Returning
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <Card className="mt-8 mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-deep-teal mb-6 text-center">
                Tell us about yourself
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
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
                  <Label htmlFor="pregnancyStage">Stage of Pregnancy</Label>
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
              </div>
              <div className="mt-6 pb-4">
                <button 
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors"
                  style={{
                    backgroundColor: 'hsl(146, 27%, 56%)',
                    color: 'white',
                    border: '2px solid hsl(146, 27%, 56%)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'hsl(146, 27%, 50%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'hsl(146, 27%, 56%)';
                  }}
                  disabled={!isFormValid()}
                >
                  Continue
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="mt-8 mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-deep-teal mb-6 text-center">
                A few more details
              </h2>
              <div className="space-y-4">
                {formData.pregnancyStage !== "postpartum" ? (
                  // Pregnancy questions (mandatory)
                  <>
                    <div>
                      <Label htmlFor="pregnancyWeek">Pregnancy Week *</Label>
                      <Input
                        id="pregnancyWeek"
                        type="number"
                        value={formData.pregnancyWeek}
                        onChange={(e) => handleInputChange("pregnancyWeek", e.target.value)}
                        placeholder="e.g., 24"
                        className="mt-1"
                        min="1"
                        max="42"
                        required
                      />
                      {formData.pregnancyStage && (
                        <p className="text-sm text-gray-500 mt-1">
                          {formData.pregnancyStage} trimester is {getTrimesterRange(formData.pregnancyStage)}
                        </p>
                      )}
                      {getValidationMessage() && (
                        <div className="flex items-center mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="text-red-500 mr-2" size={16} />
                          <p className="text-sm text-red-700">{getValidationMessage()}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange("dueDate", e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">Would you like to share anything about your pregnancy to help us personalize your care?</Label>
                      <p className="text-sm text-gray-500 mb-3">(Optional – select all that apply)</p>
                      <div className="space-y-3">
                        {[
                          "This is my first pregnancy",
                          "I've had previous pregnancies",
                          "High-risk pregnancy",
                          "Multiple babies (twins, triplets, etc.)",
                          "Complications or special concerns",
                          "I'm navigating loss or uncertainty",
                          "I'm still figuring things out",
                          "I'd rather not say"
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pregnancy-${option}`}
                              checked={formData.pregnancyExperience.includes(option)}
                              onCheckedChange={(checked) => handleCheckboxChange('pregnancyExperience', option, checked as boolean)}
                            />
                            <Label htmlFor={`pregnancy-${option}`} className="text-sm font-normal">{option}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Would you like extra support with…</Label>
                      <p className="text-sm text-gray-500 mb-3">(Optional – select all that apply)</p>
                      <div className="space-y-3">
                        {[
                          "Preparing for birth",
                          "Managing symptoms",
                          "Emotional wellbeing",
                          "Nutrition & wellness",
                          "Talking with providers",
                          "My relationship or support system",
                          "Something else / not sure yet"
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pregnancy-support-${option}`}
                              checked={formData.supportNeeds.includes(option)}
                              onCheckedChange={(checked) => handleCheckboxChange('supportNeeds', option, checked as boolean)}
                            />
                            <Label htmlFor={`pregnancy-support-${option}`} className="text-sm font-normal">{option}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  // Postpartum questions
                  <>
                    <div>
                      <Label htmlFor="babyBirthDate">When was your baby born? *</Label>
                      <Input
                        id="babyBirthDate"
                        type="date"
                        value={formData.babyBirthDate}
                        onChange={(e) => handleInputChange("babyBirthDate", e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">Would you like to share a little about your birth so we can better support you?</Label>
                      <p className="text-sm text-gray-500 mb-3">(Optional – select all that apply)</p>
                      <div className="space-y-3">
                        {[
                          "Baby arrived full-term",
                          "Baby was preterm", 
                          "Vaginal birth",
                          "Cesarean birth",
                          "Planned induction",
                          "Emergency delivery",
                          "NICU stay",
                          "Complications during birth",
                          "We lost our baby",
                          "I'm still processing my experience",
                          "I'd rather not say"
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`birth-${option}`}
                              checked={formData.birthExperience.includes(option)}
                              onCheckedChange={(checked) => handleCheckboxChange('birthExperience', option, checked as boolean)}
                            />
                            <Label htmlFor={`birth-${option}`} className="text-sm font-normal">{option}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Would you like support with any of the following?</Label>
                      <p className="text-sm text-gray-500 mb-3">(Optional – select all that apply)</p>
                      <div className="space-y-3">
                        {[
                          "Breastfeeding / feeding routines",
                          "Emotional wellness / mood",
                          "Sleep & recovery",
                          "Birth healing / trauma",
                          "Scheduling care and appointments",
                          "Connecting with other moms",
                          "None right now"
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`support-${option}`}
                              checked={formData.supportNeeds.includes(option)}
                              onCheckedChange={(checked) => handleCheckboxChange('supportNeeds', option, checked as boolean)}
                            />
                            <Label htmlFor={`support-${option}`} className="text-sm font-normal">{option}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 pb-4">
                <button 
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors"
                  style={{
                    backgroundColor: 'hsl(146, 27%, 56%)',
                    color: 'white',
                    border: '2px solid hsl(146, 27%, 56%)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'hsl(146, 27%, 50%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'hsl(146, 27%, 56%)';
                  }}
                  disabled={createUserMutation.isPending || !isFormValid()}
                >
                  Continue
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="mt-8 mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-sage to-lavender rounded-full flex items-center justify-center mb-6">
                  <Heart className="text-white text-2xl" size={32} />
                </div>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  {formData.pregnancyStage === "postpartum" 
                    ? "Thank you for trusting us with your story. However your journey unfolded and whatever support you need, you're not alone. We're here to walk it with you."
                    : "Thank you for sharing. Wherever you are in your pregnancy journey, we're here to support you with care that adapts to you."
                  }
                </p>
                <button 
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors"
                  style={{
                    backgroundColor: 'hsl(146, 27%, 56%)',
                    color: 'white',
                    border: '2px solid hsl(146, 27%, 56%)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'hsl(146, 27%, 50%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'hsl(146, 27%, 56%)';
                  }}
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? "Creating Profile..." : "Complete Setup"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
