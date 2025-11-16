import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, AlertCircle, Search, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import maternalIcon from "@assets/generated_images/Pregnant_woman_bun_hairstyle_sage_272a5b6e.png";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showButtons, setShowButtons] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    zipCode: "",
    pregnancyWeek: "",
    pregnancyStage: "",
    dueDate: "",
    babyBirthDate: "",
    pregnancyExperience: [] as string[],
    birthExperience: [] as string[],
    supportNeeds: [] as string[],
    isPostpartum: false,
    obMidwifeName: "",
    obMidwifePractice: "",
    obMidwifeEmail: "",
    doulaName: "",
    doulaPractice: "",
    doulaEmail: "",
  });
  const [showEmailExistsError, setShowEmailExistsError] = useState(false);
  const [wantsPartnerInvite, setWantsPartnerInvite] = useState<boolean | null>(null);
  const [partnerInviteCode, setPartnerInviteCode] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [enteredInviteCode, setEnteredInviteCode] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLookingUpProvider, setIsLookingUpProvider] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest("POST", "/api/users", {
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        location: userData.location,
        zipCode: userData.zipCode,
        pregnancyStage: userData.pregnancyStage,
        pregnancyWeek: userData.pregnancyWeek ? parseInt(userData.pregnancyWeek) : undefined,
        dueDate: userData.dueDate ? new Date(userData.dueDate) : undefined,
        isPostpartum: userData.pregnancyStage === "postpartum",
        babyBirthDate: userData.babyBirthDate ? new Date(userData.babyBirthDate) : undefined,
        pregnancyExperience: userData.pregnancyExperience,
        birthExperience: userData.birthExperience,
        supportNeeds: userData.supportNeeds,
        userType: userData.pregnancyStage === "supporter" ? "partner" : "mother",
        obMidwifeName: userData.obMidwifeName,
        obMidwifePractice: userData.obMidwifePractice,
        obMidwifeEmail: userData.obMidwifeEmail,
        doulaName: userData.doulaName,
        doulaPractice: userData.doulaPractice,
        doulaEmail: userData.doulaEmail,
        preferences: {},
      });
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUserId", user.id.toString());
      setUserId(user.id);
      
      // Route based on waitlist status
      if (user.waitlistUser) {
        setLocation("/waitlist");
      } else {
        // For moms and trying_to_conceive, proceed to partner invitation step
        toast({
          title: "Profile created!",
          description: "Almost done...",
        });
        setStep(5); // Move to partner invitation step
      }
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

  const generateInviteCodeMutation = useMutation({
    mutationFn: async ({ motherId }: { motherId: number }) => {
      const response = await apiRequest("POST", "/api/partnerships/generate", {
        motherId,
        relationshipType: "partner",
      });
      return response.json();
    },
    onSuccess: (partnership) => {
      setPartnerInviteCode(partnership.inviteCode);
      toast({
        title: "Invite code generated!",
        description: "Share this code with your partner to connect.",
      });
    },
    onError: (error) => {
      console.error("Error generating invite code:", error);
      toast({
        title: "Error",
        description: "Failed to generate invite code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerPartnerMutation = useMutation({
    mutationFn: async ({ inviteCode, userData }: { inviteCode: string; userData: typeof formData }) => {
      const response = await apiRequest("POST", "/api/partners/register", {
        inviteCode: inviteCode.toUpperCase(),
        userData: {
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          location: userData.location,
          zipCode: userData.zipCode,
          pregnancyStage: userData.pregnancyStage,
          userType: "partner",
          preferences: {},
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("currentUserId", data.user.id.toString());
      toast({
        title: "Successfully connected!",
        description: "You're now connected with your partner's journey.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Error registering partner:", error);
      const message = error?.message || "Invalid or expired invite code";
      setInviteCodeError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });



  const handleSubmit = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // For partners, use atomic registration endpoint
      if (formData.pregnancyStage === "supporter") {
        if (!enteredInviteCode) {
          setInviteCodeError("Please enter an invite code");
          return;
        }
        // Atomically register partner and link to mother
        registerPartnerMutation.mutate({
          inviteCode: enteredInviteCode,
          userData: formData,
        });
        return;
      }
      
      // Validate due date before submission for pregnant users
      if (formData.pregnancyStage !== "postpartum" && formData.pregnancyStage !== "trying_to_conceive") {
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
      
      // Move to provider information step
      setStep(4);
    } else if (step === 4) {
      // Create user with provider information
      const submitData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
      };
      createUserMutation.mutate(submitData);
    }
  };

  const handlePartnerInviteComplete = () => {
    toast({
      title: "Welcome to your digital village!",
      description: "Your profile has been created successfully.",
    });
    setLocation("/");
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

  const handleLookupProvider = async (type: 'ob' | 'doula') => {
    const practiceName = type === 'ob' ? formData.obMidwifePractice : formData.doulaPractice;
    const location = formData.location || "Detroit, MI";
    
    if (!practiceName) {
      toast({
        title: "Practice name required",
        description: "Please enter the practice or office name to look up contact information.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLookingUpProvider(true);
    
    try {
      const response = await fetch(`/api/provider/lookup?practice=${encodeURIComponent(practiceName)}&location=${encodeURIComponent(location)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.email) {
          if (type === 'ob') {
            handleInputChange('obMidwifeEmail', data.email);
          } else {
            handleInputChange('doulaEmail', data.email);
          }
          
          toast({
            title: "Contact info found!",
            description: `We found contact information for ${practiceName}.`,
          });
        } else {
          toast({
            title: "No email found",
            description: `We found ${practiceName} but couldn't locate an email address. You can add it manually or leave it blank for now.`,
          });
        }
      } else {
        toast({
          title: "Couldn't find practice",
          description: "Try checking the spelling or enter the information manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search error",
        description: "Couldn't complete the search. Please enter the information manually.",
        variant: "destructive",
      });
    } finally {
      setIsLookingUpProvider(false);
    }
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
      return formData.firstName && formData.lastName && formData.email && formData.location && formData.zipCode && formData.pregnancyStage && termsAccepted;
    }
    if (step === 3) {
      if (formData.pregnancyStage === "postpartum") {
        // For postpartum: baby birth date is required
        return formData.babyBirthDate;
      } else if (formData.pregnancyStage === "supporter") {
        // For supporters: invite code is required
        return enteredInviteCode && enteredInviteCode.length >= 6;
      } else if (formData.pregnancyStage === "trying_to_conceive") {
        // No additional fields required for trying to conceive
        return true;
      } else {
        // For pregnant: due date is required
        return formData.dueDate;
      }
    }
    return true;
  };

  // Show buttons immediately on step 1
  useEffect(() => {
    if (step === 1) {
      setShowButtons(true);
    }
  }, [step]);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-6">
        {step === 1 && (
          <div className="text-center mt-8">
            <div className="w-32 h-32 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
              <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
            <h1 className="text-3xl font-bold text-deep-teal mb-4">
              Hi, I'm Nia
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              I'm your digital doula, and I'm so glad you're here.
              <br/>
              Think of me as a friend who listens, supports, and walks with you every step of the way.
              <br/>
              Let's get to know each other.
            </p>
            {showButtons && (
              <div className="space-y-4 px-4 animate-fade-in">
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl text-lg font-semibold shadow-lg transition-colors"
                style={{
                  backgroundColor: 'hsl(340, 70%, 75%)',
                  color: 'white',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'hsl(340, 70%, 70%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'hsl(340, 70%, 75%)';
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
                  color: 'hsl(340, 70%, 75%)',
                  border: '2px solid hsl(340, 70%, 75%)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'hsl(340, 70%, 75%)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'hsl(340, 70%, 75%)';
                }}
              >
                I'm Returning
              </button>
            </div>
            )}
          </div>
        )}

        {step === 2 && (
          <Card className="mt-8 mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-deep-teal mb-6 text-center">
                Tell me about yourself
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
                  <Label htmlFor="location">What city or area do you call home?</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, State (e.g., Detroit, MI)"
                    className="mt-1"
                    data-testid="input-location"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="Enter your zip code"
                    className="mt-1"
                    maxLength={5}
                    data-testid="input-zipcode"
                  />
                </div>
                <div>
                  <Label htmlFor="pregnancyStage">Where are you in your journey?</Label>
                  <Select 
                    value={formData.pregnancyStage} 
                    onValueChange={(value) => handleInputChange("pregnancyStage", value)}
                  >
                    <SelectTrigger className="mt-1" data-testid="select-pregnancy-stage">
                      <SelectValue placeholder="Select your current stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trying_to_conceive">Trying to conceive</SelectItem>
                      <SelectItem value="first">First trimester (0–13 weeks)</SelectItem>
                      <SelectItem value="second">Second trimester (14–27 weeks)</SelectItem>
                      <SelectItem value="third">Third trimester (28+ weeks)</SelectItem>
                      <SelectItem value="postpartum">Postpartum / 4th trimester</SelectItem>
                      <SelectItem value="supporter">Partner / Supporter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-start space-x-3 pt-4 pb-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    data-testid="checkbox-terms"
                    className="mt-1"
                  />
                  <Label 
                    htmlFor="terms" 
                    className="text-sm text-gray-600 leading-relaxed cursor-pointer"
                  >
                    I agree to The Heart Next Door's{" "}
                    <a 
                      href="/terms" 
                      target="_blank"
                      className="text-blush underline hover:text-blush/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms & Conditions
                    </a>
                    {" "}and{" "}
                    <a 
                      href="/privacy" 
                      target="_blank"
                      className="text-blush underline hover:text-blush/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>
                  </Label>
                </div>
              </div>
              <div className="mt-6 pb-4">
                <button 
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors"
                  style={{
                    backgroundColor: 'hsl(340, 70%, 75%)',
                    color: 'white',
                    border: '2px solid hsl(340, 70%, 75%)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'hsl(340, 70%, 70%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'hsl(340, 70%, 75%)';
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
                {formData.pregnancyStage === "postpartum" ? (
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
                ) : formData.pregnancyStage === "trying_to_conceive" ? (
                  // Minimal questions for trying to conceive
                  <>
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        We're here for you on your journey. Let's get you connected with Nia!
                      </p>
                    </div>
                  </>
                ) : formData.pregnancyStage === "supporter" ? (
                  // Partner/supporter needs invite code
                  <>
                    <div>
                      <Label htmlFor="inviteCode" className="text-base font-medium">Enter Your Invite Code</Label>
                      <p className="text-sm text-gray-500 mb-3">
                        Your partner should have shared an invite code with you. Enter it here to connect.
                      </p>
                      <Input
                        id="inviteCode"
                        type="text"
                        value={enteredInviteCode}
                        onChange={(e) => {
                          setEnteredInviteCode(e.target.value.toUpperCase());
                          setInviteCodeError("");
                        }}
                        placeholder="Enter 8-character code"
                        className="mt-1 uppercase text-center text-lg tracking-wider"
                        maxLength={10}
                        required
                        data-testid="input-invite-code"
                      />
                      {inviteCodeError && (
                        <div className="flex items-center mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="text-red-500 mr-2" size={16} />
                          <p className="text-sm text-red-700">{inviteCodeError}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600">
                        Don't have a code? Ask your partner to generate one during their sign-up.
                      </p>
                    </div>
                  </>
                ) : (
                  // Pregnancy questions for first, second, third trimesters
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
                )}
              </div>
              <div className="mt-6 pb-4">
                <button 
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors"
                  style={{
                    backgroundColor: 'hsl(340, 70%, 75%)',
                    color: 'white',
                    border: '2px solid hsl(340, 70%, 75%)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'hsl(340, 70%, 70%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'hsl(340, 70%, 75%)';
                  }}
                  disabled={createUserMutation.isPending || registerPartnerMutation.isPending || !isFormValid()}
                >
                  {registerPartnerMutation.isPending ? "Connecting..." : createUserMutation.isPending ? "Creating profile..." : "Continue"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="mt-8 mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-deep-teal mb-2 text-center">Healthcare Provider Information</h2>
              <p className="text-gray-600 mb-6 text-center text-sm">
                Help us keep you safe. We'll notify your providers if any red flags arise during your journey.
              </p>
              
              <div className="space-y-6">
                {/* OB/Midwife Section */}
                <div className="space-y-4 pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-deep-teal">OB or Midwife</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="obMidwifeName" className="text-sm font-medium">Provider Name</Label>
                    <Input 
                      id="obMidwifeName"
                      type="text" 
                      placeholder="Dr. Jane Smith"
                      value={formData.obMidwifeName}
                      onChange={(e) => handleInputChange("obMidwifeName", e.target.value)}
                      data-testid="input-ob-midwife-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="obMidwifePractice" className="text-sm font-medium">Office or Practice Name</Label>
                    <Input 
                      id="obMidwifePractice"
                      type="text" 
                      placeholder="Detroit Women's Health Clinic"
                      value={formData.obMidwifePractice}
                      onChange={(e) => handleInputChange("obMidwifePractice", e.target.value)}
                      data-testid="input-ob-midwife-practice"
                    />
                    <p className="text-xs text-gray-500">This helps us find their contact info for you</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="obMidwifeEmail" className="text-sm font-medium">
                      Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        id="obMidwifeEmail"
                        type="email" 
                        placeholder="office@clinic.com"
                        value={formData.obMidwifeEmail}
                        onChange={(e) => handleInputChange("obMidwifeEmail", e.target.value)}
                        data-testid="input-ob-midwife-email"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleLookupProvider('ob')}
                        disabled={isLookingUpProvider || !formData.obMidwifePractice}
                        className="shrink-0"
                        data-testid="button-lookup-ob"
                      >
                        {isLookingUpProvider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Don't know it? We can help you look it up!</p>
                  </div>
                </div>

                {/* Doula Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-deep-teal">Doula <span className="text-gray-400 font-normal text-sm">(Optional)</span></h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doulaName" className="text-sm font-medium">Doula Name</Label>
                    <Input 
                      id="doulaName"
                      type="text" 
                      placeholder="Sarah Johnson"
                      value={formData.doulaName}
                      onChange={(e) => handleInputChange("doulaName", e.target.value)}
                      data-testid="input-doula-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doulaPractice" className="text-sm font-medium">Practice or Business Name</Label>
                    <Input 
                      id="doulaPractice"
                      type="text" 
                      placeholder="Birth Support Services"
                      value={formData.doulaPractice}
                      onChange={(e) => handleInputChange("doulaPractice", e.target.value)}
                      data-testid="input-doula-practice"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doulaEmail" className="text-sm font-medium">Email Address</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="doulaEmail"
                        type="email" 
                        placeholder="sarah@doulaservices.com"
                        value={formData.doulaEmail}
                        onChange={(e) => handleInputChange("doulaEmail", e.target.value)}
                        data-testid="input-doula-email"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleLookupProvider('doula')}
                        disabled={isLookingUpProvider || !formData.doulaPractice}
                        className="shrink-0"
                        data-testid="button-lookup-doula"
                      >
                        {isLookingUpProvider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">We can help find this information for you</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors"
                  style={{
                    backgroundColor: 'hsl(340, 70%, 75%)',
                    color: 'white',
                    border: '2px solid hsl(340, 70%, 75%)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'hsl(340, 70%, 70%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'hsl(340, 70%, 75%)';
                  }}
                  disabled={createUserMutation.isPending || !formData.obMidwifeName || !formData.obMidwifeEmail}
                  data-testid="button-continue-provider"
                >
                  {createUserMutation.isPending ? "Creating profile..." : "Continue"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card className="mt-8 mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blush to-lavender rounded-full flex items-center justify-center mb-6">
                  <Heart className="text-white text-2xl" size={32} />
                </div>

                <h3 className="text-2xl font-bold text-deep-teal mb-3">
                  One more thing...
                </h3>
                
                {wantsPartnerInvite === null ? (
                  <div>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                      Would you like to invite your partner or a supporter to stay connected with your journey?
                    </p>
                    <p className="text-sm text-gray-600 mb-8">
                      They'll be able to see updates you choose to share, helping them support you better.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setWantsPartnerInvite(true);
                          if (userId) {
                            generateInviteCodeMutation.mutate({ motherId: userId });
                          }
                        }}
                        className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors"
                        style={{
                          backgroundColor: 'hsl(340, 70%, 75%)',
                          color: 'white',
                          border: '2px solid hsl(340, 70%, 75%)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'hsl(340, 70%, 70%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'hsl(340, 70%, 75%)';
                        }}
                        data-testid="button-invite-partner"
                      >
                        Yes, invite my partner
                      </button>
                      <button 
                        onClick={() => {
                          setWantsPartnerInvite(false);
                          handlePartnerInviteComplete();
                        }}
                        className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors border-2"
                        style={{
                          backgroundColor: 'white',
                          color: 'hsl(340, 70%, 75%)',
                          border: '2px solid hsl(340, 70%, 75%)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'hsl(340, 70%, 95%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                        data-testid="button-skip-partner-invite"
                      >
                        Skip for now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {partnerInviteCode ? (
                      <div>
                        <p className="text-lg text-gray-700 mb-6">
                          Share this code with your partner or supporter:
                        </p>
                        <div className="bg-blush/10 border-2 border-blush rounded-xl p-6 mb-6">
                          <p className="text-3xl font-bold text-deep-teal tracking-wider" data-testid="text-invite-code">
                            {partnerInviteCode}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mb-8">
                          This code expires in 7 days. They can use it during sign-up to connect with you.
                        </p>
                        <button 
                          onClick={handlePartnerInviteComplete}
                          className="w-full py-3 rounded-2xl font-semibold shadow-lg transition-colors"
                          style={{
                            backgroundColor: 'hsl(340, 70%, 75%)',
                            color: 'white',
                            border: '2px solid hsl(340, 70%, 75%)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'hsl(340, 70%, 70%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'hsl(340, 70%, 75%)';
                          }}
                          data-testid="button-complete-onboarding"
                        >
                          Continue to Home
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-4">Generating your invite code...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
