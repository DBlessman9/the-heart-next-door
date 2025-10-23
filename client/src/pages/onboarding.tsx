import { useState, useEffect } from "react";
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
import maternalIcon from "@assets/generated_images/Pregnant_woman_bun_hairstyle_sage_272a5b6e.png";

const TypingText = ({ text, speed = 50, delay = 0 }: { text: string; speed?: number; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, delay]);

  return <>{displayedText}</>;
};

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
  const [showEmailExistsError, setShowEmailExistsError] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest("POST", "/api/users", {
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        pregnancyStage: userData.pregnancyStage,
        pregnancyWeek: userData.pregnancyWeek ? parseInt(userData.pregnancyWeek) : undefined,
        dueDate: userData.dueDate ? new Date(userData.dueDate) : undefined,
        isPostpartum: userData.pregnancyStage === "postpartum",
        babyBirthDate: userData.babyBirthDate ? new Date(userData.babyBirthDate) : undefined,
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
    onError: (error: any) => {
      console.error("Profile creation error:", error);
      
      // Check if it's a duplicate email error
      if (error?.message?.includes("duplicate_email") || error?.message?.includes("email already exists")) {
        setShowEmailExistsError(true);
        toast({
          title: "Email already registered",
          description: "An account with this email already exists.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating profile",
          description: "Please check your information and try again.",
          variant: "destructive",
        });
      }
    },
  });



  const handleSubmit = () => {
    if (step < 4) {
      // Validate due date before proceeding from step 3
      if (step === 3 && formData.pregnancyStage !== "postpartum") {
        const validation = validateDueDate();
        if (!validation.isValid) {
          toast({
            title: "Due Date Error",
            description: validation.error,
            variant: "destructive",
          });
          return;
        }
      }
      setStep(step + 1);
    } else {
      // Final submission
      const submitData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
      };
      createUserMutation.mutate(submitData);
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

  const validateDueDate = () => {
    if (!formData.dueDate || !formData.pregnancyStage || formData.pregnancyStage === "postpartum") {
      return { isValid: true, error: "" };
    }

    const today = new Date();
    const dueDate = new Date(formData.dueDate);
    const weeksUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Calculate expected week ranges for each trimester
    const trimesterRanges = {
      first: { minWeeks: 28, maxWeeks: 40 }, // weeks 0-12, so 28-40 weeks until due
      second: { minWeeks: 13, maxWeeks: 27 }, // weeks 13-27, so 13-27 weeks until due  
      third: { minWeeks: 0, maxWeeks: 12 }    // weeks 28-40, so 0-12 weeks until due
    };

    const range = trimesterRanges[formData.pregnancyStage as keyof typeof trimesterRanges];
    if (!range) {
      return { isValid: true, error: "" };
    }

    if (weeksUntilDue < range.minWeeks || weeksUntilDue > range.maxWeeks) {
      const trimesterNames = {
        first: "first trimester (weeks 1-12)",
        second: "second trimester (weeks 13-27)", 
        third: "third trimester (weeks 28-40)"
      };
      
      return {
        isValid: false,
        error: `Due date doesn't align with ${trimesterNames[formData.pregnancyStage as keyof typeof trimesterNames]}. Expected ${range.minWeeks}-${range.maxWeeks} weeks until delivery.`
      };
    }

    return { isValid: true, error: "" };
  };

  const handleLoginExistingUser = async () => {
    try {
      // Try to find user by email
      const response = await fetch(`/api/users/email/${encodeURIComponent(formData.email)}`);
      if (response.ok) {
        const user = await response.json();
        localStorage.setItem("currentUserId", user.id.toString());
        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
        setLocation("/");
      } else {
        toast({
          title: "Login failed",
          description: "Unable to find your account. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
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
        // For pregnant: due date is required
        return formData.dueDate;
      }
    }
    return true;
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-6">
        {step === 1 && (
          <div className="text-center mt-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-sage to-lavender rounded-full flex items-center justify-center mb-6 p-1 animate-fade-in">
              <img src={maternalIcon} alt="Maternal care" className="w-full h-full object-cover rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
            </div>
            <h1 className="text-3xl font-bold text-deep-teal mb-4">
              <TypingText text="Hi mama, I'm Nia." speed={80} delay={500} />
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              <TypingText text="I'm your digital doula, and I'm so glad you're here." speed={40} delay={2000} />
              <br/>
              <TypingText text="Think of me as a friend who listens, supports, and walks with you every step of the way." speed={40} delay={5000} />
              <br/>
              <TypingText text="Let's get to know each other." speed={50} delay={9500} />
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
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange("dueDate", e.target.value)}
                        className="mt-1"
                        required
                      />
                      {formData.dueDate && formData.pregnancyStage && !validateDueDate().isValid && (
                        <div className="flex items-center mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="text-red-500 mr-2" size={16} />
                          <p className="text-sm text-red-700">{validateDueDate().error}</p>
                        </div>
                      )}
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
                    : "Thank you for sharing. Wherever you are in your pregnancy journey, we're here to support you with care that meets you where you are."
                  }
                </p>
                {showEmailExistsError ? (
                  <div className="space-y-3">
                    <p className="text-sm text-red-600 mb-4">
                      An account with this email already exists.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={handleLoginExistingUser}
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
                      >
                        Login to Existing Account
                      </button>
                      <button 
                        onClick={() => {
                          setShowEmailExistsError(false);
                          setStep(1);
                        }}
                        className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors border-2"
                        style={{
                          backgroundColor: 'white',
                          color: 'hsl(146, 27%, 56%)',
                          border: '2px solid hsl(146, 27%, 56%)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'hsl(146, 27%, 96%)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'white';
                        }}
                      >
                        Use Different Email
                      </button>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
