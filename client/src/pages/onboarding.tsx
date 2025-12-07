import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, ChevronLeft, Search, Loader2, Check, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOTAL_STEPS = 8;

interface SelectableCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  testId?: string;
}

function SelectableCard({ emoji, label, selected, onClick, testId }: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`w-full p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 border-2 ${
        selected 
          ? 'border-pink-400 bg-pink-50 shadow-md' 
          : 'border-gray-100 bg-white hover:border-pink-200 hover:bg-pink-50/50'
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-gray-800 font-medium flex-1">{label}</span>
      {selected && (
        <div className="w-6 h-6 rounded-full bg-pink-400 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}

interface MultiSelectCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function MultiSelectCard({ emoji, label, selected, onClick }: MultiSelectCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 border-2 ${
        selected 
          ? 'border-pink-400 bg-pink-50' 
          : 'border-gray-100 bg-white hover:border-pink-200'
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-gray-700 flex-1">{label}</span>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
        selected ? 'bg-pink-400 border-pink-400' : 'border-gray-300'
      }`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
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
    noProviderYet: false,
  });
  const [wantsPartnerInvite, setWantsPartnerInvite] = useState<boolean | null>(null);
  const [showNoProviderDisclaimer, setShowNoProviderDisclaimer] = useState(false);
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
        noProviderYet: userData.noProviderYet,
        preferences: {},
      });
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUserId", user.id.toString());
      setUserId(user.id);
      
      if (user.waitlistUser) {
        setLocation("/waitlist");
      } else {
        toast({
          title: "Profile created!",
          description: "Almost done...",
        });
        setStep(8);
      }
    },
    onError: (error: any) => {
      if (error?.message?.includes("duplicate_email") || error?.message?.includes("email already exists")) {
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
    },
    onError: () => {
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
      const message = error?.message || "Invalid or expired invite code";
      setInviteCodeError(message);
    },
  });

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
            description: `We found ${practiceName} but couldn't locate an email address.`,
          });
        }
      } else {
        toast({
          title: "Couldn't find practice",
          description: "Try checking the spelling or enter the information manually.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Search error",
        description: "Couldn't complete the search. Please enter the information manually.",
        variant: "destructive",
      });
    } finally {
      setIsLookingUpProvider(false);
    }
  };

  const handlePartnerInviteComplete = () => {
    toast({
      title: "Welcome to your digital village!",
      description: "Your profile has been created successfully.",
    });
    setLocation("/");
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canSkip = () => {
    return step === 5 || step === 6;
  };

  const handleSkip = () => {
    if (step === 5) setStep(6);
    else if (step === 6) setStep(7);
  };

  const getProgress = () => {
    return ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  };

  const journeyOptions = [
    { value: "trying_to_conceive", emoji: "🌱", label: "Trying to conceive" },
    { value: "first", emoji: "🌸", label: "First trimester (0–13 weeks)" },
    { value: "second", emoji: "🌷", label: "Second trimester (14–27 weeks)" },
    { value: "third", emoji: "🌺", label: "Third trimester (28+ weeks)" },
    { value: "postpartum", emoji: "👶", label: "Postpartum / 4th trimester" },
    { value: "supporter", emoji: "💑", label: "Partner / Supporter" },
  ];

  const supportNeedsOptions = [
    { emoji: "🍼", label: "Breastfeeding / feeding routines" },
    { emoji: "💭", label: "Emotional wellness / mood" },
    { emoji: "😴", label: "Sleep & recovery" },
    { emoji: "💗", label: "Birth healing / trauma" },
    { emoji: "📅", label: "Scheduling care and appointments" },
    { emoji: "👩‍👩‍👧", label: "Connecting with other moms" },
    { emoji: "✨", label: "None right now" },
  ];

  const pregnancySupportOptions = [
    { emoji: "👶", label: "Preparing for birth" },
    { emoji: "🤢", label: "Managing symptoms" },
    { emoji: "🧘", label: "Emotional wellbeing" },
    { emoji: "🥗", label: "Nutrition & wellness" },
    { emoji: "🩺", label: "Talking with providers" },
    { emoji: "💕", label: "My relationship or support system" },
    { emoji: "❓", label: "Something else / not sure yet" },
  ];

  const pregnancyExperienceOptions = [
    { emoji: "🌟", label: "This is my first pregnancy" },
    { emoji: "👶", label: "I've had previous pregnancies" },
    { emoji: "⚠️", label: "High-risk pregnancy" },
    { emoji: "👯", label: "Multiple babies (twins, triplets, etc.)" },
    { emoji: "💭", label: "Complications or special concerns" },
    { emoji: "🕊️", label: "I'm navigating loss or uncertainty" },
    { emoji: "🤔", label: "I'm still figuring things out" },
  ];

  const birthExperienceOptions = [
    { emoji: "✅", label: "Baby arrived full-term" },
    { emoji: "🌸", label: "Baby was preterm" },
    { emoji: "💫", label: "Vaginal birth" },
    { emoji: "🏥", label: "Cesarean birth" },
    { emoji: "📋", label: "Planned induction" },
    { emoji: "🚨", label: "Emergency delivery" },
    { emoji: "💝", label: "NICU stay" },
    { emoji: "🕊️", label: "We lost our baby" },
    { emoji: "💭", label: "I'm still processing my experience" },
  ];

  const isStep2Valid = formData.firstName && formData.lastName && formData.email;
  const isStep3Valid = formData.location && formData.zipCode && termsAccepted;
  const isStep4Valid = formData.pregnancyStage !== "";
  const isStep5Valid = () => {
    if (formData.pregnancyStage === "postpartum") return !!formData.babyBirthDate;
    if (formData.pregnancyStage === "supporter") return enteredInviteCode.length >= 6;
    if (formData.pregnancyStage === "trying_to_conceive") return true;
    return !!formData.dueDate;
  };
  const isStep7Valid = formData.noProviderYet || (formData.obMidwifeName && formData.obMidwifeEmail);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {step > 1 && step < 8 && (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-pink-100">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={goBack}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-800 transition-colors"
                data-testid="button-back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex-1 mx-4">
                <div className="h-1.5 bg-pink-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>
              
              {canSkip() ? (
                <button 
                  onClick={handleSkip}
                  className="text-pink-500 font-medium text-sm hover:text-pink-600 transition-colors"
                  data-testid="button-skip"
                >
                  Skip
                </button>
              ) : (
                <div className="w-10" />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-6 py-8">
        {step === 1 && (
          <div className="text-center pt-12 animate-fade-in">
            <div className="w-28 h-28 mx-auto bg-white border-4 border-pink-200 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <Heart className="w-14 h-14 text-red-500 fill-red-500 animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              The Heart Next Door
            </h1>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Your digital village, here to listen, support, and walk with you every step of the way.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                data-testid="button-get-started"
              >
                Get Started
              </button>
              
              <button 
                onClick={() => {
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
                className="w-full py-4 rounded-full text-lg font-semibold text-pink-500 border-2 border-pink-300 hover:bg-pink-50 transition-all duration-200"
                data-testid="button-returning"
              >
                I'm Returning
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                What's your name?
              </h2>
              <p className="text-gray-500">Let's get to know each other</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  className="mt-2 h-14 rounded-2xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-lg"
                  data-testid="input-first-name"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  className="mt-2 h-14 rounded-2xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-lg"
                  data-testid="input-last-name"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className="mt-2 h-14 rounded-2xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-lg"
                  data-testid="input-email"
                />
              </div>
            </div>
            
            <button 
              onClick={() => setStep(3)}
              disabled={!isStep2Valid}
              className="w-full py-4 mt-8 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200"
              data-testid="button-continue"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Where are you located?
              </h2>
              <p className="text-gray-500">This helps us personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-gray-700 font-medium">City & State</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Detroit, MI"
                  className="mt-2 h-14 rounded-2xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-lg"
                  data-testid="input-location"
                />
              </div>
              
              <div>
                <Label htmlFor="zipCode" className="text-gray-700 font-medium">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="48201"
                  maxLength={5}
                  className="mt-2 h-14 rounded-2xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-lg"
                  data-testid="input-zipcode"
                />
              </div>
            </div>
            
            <div className="flex items-start space-x-3 pt-4 bg-white/60 rounded-2xl p-4 border border-pink-100">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                data-testid="checkbox-terms"
                className="mt-0.5 border-pink-300 data-[state=checked]:bg-pink-400 data-[state=checked]:border-pink-400"
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                I agree to The Heart Next Door's{" "}
                <a href="/terms" target="_blank" className="text-pink-500 underline">Terms & Conditions</a>
                {" "}and{" "}
                <a href="/privacy" target="_blank" className="text-pink-500 underline">Privacy Policy</a>
              </Label>
            </div>
            
            <button 
              onClick={() => setStep(4)}
              disabled={!isStep3Valid}
              className="w-full py-4 mt-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200"
              data-testid="button-continue"
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Where are you in your journey?
              </h2>
              <p className="text-gray-500">Select the option that best describes you</p>
            </div>
            
            <div className="space-y-3">
              {journeyOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  emoji={option.emoji}
                  label={option.label}
                  selected={formData.pregnancyStage === option.value}
                  onClick={() => handleInputChange("pregnancyStage", option.value)}
                  testId={`card-${option.value}`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setStep(5)}
              disabled={!isStep4Valid}
              className="w-full py-4 mt-6 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200"
              data-testid="button-continue"
            >
              Continue
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            {formData.pregnancyStage === "postpartum" ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    When was your baby born?
                  </h2>
                  <p className="text-gray-500">This helps us track your recovery journey</p>
                </div>
                
                <div>
                  <Input
                    id="babyBirthDate"
                    type="date"
                    value={formData.babyBirthDate}
                    onChange={(e) => handleInputChange("babyBirthDate", e.target.value)}
                    className="h-14 rounded-2xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-lg"
                    data-testid="input-baby-birth-date"
                  />
                </div>
                
                <div className="pt-4">
                  <p className="text-gray-700 font-medium mb-3">How was your birth experience? (Optional)</p>
                  <div className="space-y-2">
                    {birthExperienceOptions.map((option) => (
                      <MultiSelectCard
                        key={option.label}
                        emoji={option.emoji}
                        label={option.label}
                        selected={formData.birthExperience.includes(option.label)}
                        onClick={() => handleCheckboxChange('birthExperience', option.label, !formData.birthExperience.includes(option.label))}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : formData.pregnancyStage === "supporter" ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Enter your invite code
                  </h2>
                  <p className="text-gray-500">Your partner shared this code with you</p>
                </div>
                
                <Input
                  id="inviteCode"
                  type="text"
                  value={enteredInviteCode}
                  onChange={(e) => {
                    setEnteredInviteCode(e.target.value.toUpperCase());
                    setInviteCodeError("");
                  }}
                  placeholder="XXXXXXXX"
                  maxLength={10}
                  className="h-16 rounded-2xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-2xl text-center tracking-widest uppercase"
                  data-testid="input-invite-code"
                />
                
                {inviteCodeError && (
                  <p className="text-red-500 text-sm text-center">{inviteCodeError}</p>
                )}
                
                <p className="text-gray-500 text-center text-sm">
                  Don't have a code? Ask your partner to generate one.
                </p>
              </>
            ) : formData.pregnancyStage === "trying_to_conceive" ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-6">🌱</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  We're here for you
                </h2>
                <p className="text-gray-600 text-lg">
                  Your journey is just beginning, and Nia is ready to support you every step of the way.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    When is your due date?
                  </h2>
                  <p className="text-gray-500">We'll personalize your experience based on this</p>
                </div>
                
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  className="h-14 rounded-2xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-lg"
                  data-testid="input-due-date"
                />
                
                <div className="pt-4">
                  <p className="text-gray-700 font-medium mb-3">Tell us about your pregnancy (Optional)</p>
                  <div className="space-y-2">
                    {pregnancyExperienceOptions.map((option) => (
                      <MultiSelectCard
                        key={option.label}
                        emoji={option.emoji}
                        label={option.label}
                        selected={formData.pregnancyExperience.includes(option.label)}
                        onClick={() => handleCheckboxChange('pregnancyExperience', option.label, !formData.pregnancyExperience.includes(option.label))}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <button 
              onClick={() => {
                if (formData.pregnancyStage === "supporter") {
                  registerPartnerMutation.mutate({
                    inviteCode: enteredInviteCode,
                    userData: formData,
                  });
                } else {
                  setStep(6);
                }
              }}
              disabled={!isStep5Valid() || registerPartnerMutation.isPending}
              className="w-full py-4 mt-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200"
              data-testid="button-continue"
            >
              {registerPartnerMutation.isPending ? "Connecting..." : "Continue"}
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                What's your biggest challenge right now?
              </h2>
              <p className="text-gray-500">Select all that apply</p>
            </div>
            
            <div className="space-y-3">
              {(formData.pregnancyStage === "postpartum" ? supportNeedsOptions : pregnancySupportOptions).map((option) => (
                <MultiSelectCard
                  key={option.label}
                  emoji={option.emoji}
                  label={option.label}
                  selected={formData.supportNeeds.includes(option.label)}
                  onClick={() => handleCheckboxChange('supportNeeds', option.label, !formData.supportNeeds.includes(option.label))}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setStep(7)}
              className="w-full py-4 mt-6 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              data-testid="button-continue"
            >
              Continue
            </button>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your Care Team
              </h2>
              <p className="text-gray-500">We'll notify them if we notice anything concerning</p>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">👩‍⚕️</span> OB or Midwife
              </h3>
              
              <div>
                <Label htmlFor="obMidwifeName" className="text-gray-600 text-sm">Provider Name</Label>
                <Input
                  id="obMidwifeName"
                  value={formData.obMidwifeName}
                  onChange={(e) => handleInputChange("obMidwifeName", e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="mt-1 h-12 rounded-xl border-gray-200 focus:border-pink-400"
                  data-testid="input-ob-name"
                />
              </div>
              
              <div>
                <Label htmlFor="obMidwifePractice" className="text-gray-600 text-sm">Practice Name</Label>
                <Input
                  id="obMidwifePractice"
                  value={formData.obMidwifePractice}
                  onChange={(e) => handleInputChange("obMidwifePractice", e.target.value)}
                  placeholder="Women's Health Clinic"
                  className="mt-1 h-12 rounded-xl border-gray-200 focus:border-pink-400"
                  data-testid="input-ob-practice"
                />
              </div>
              
              <div>
                <Label htmlFor="obMidwifeEmail" className="text-gray-600 text-sm">Email Address</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="obMidwifeEmail"
                    type="email"
                    value={formData.obMidwifeEmail}
                    onChange={(e) => handleInputChange("obMidwifeEmail", e.target.value)}
                    placeholder="office@clinic.com"
                    className="h-12 rounded-xl border-gray-200 focus:border-pink-400 flex-1"
                    data-testid="input-ob-email"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleLookupProvider('ob')}
                    disabled={isLookingUpProvider || !formData.obMidwifePractice}
                    className="h-12 w-12 rounded-xl border-pink-200 hover:bg-pink-50"
                  >
                    {isLookingUpProvider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🤱</span> Doula <span className="text-gray-400 font-normal text-sm">(Optional)</span>
              </h3>
              
              <div>
                <Label htmlFor="doulaName" className="text-gray-600 text-sm">Doula Name</Label>
                <Input
                  id="doulaName"
                  value={formData.doulaName}
                  onChange={(e) => handleInputChange("doulaName", e.target.value)}
                  placeholder="Sarah Johnson"
                  className="mt-1 h-12 rounded-xl border-gray-200 focus:border-pink-400"
                  data-testid="input-doula-name"
                />
              </div>
              
              <div>
                <Label htmlFor="doulaPractice" className="text-gray-600 text-sm">Practice Name</Label>
                <Input
                  id="doulaPractice"
                  value={formData.doulaPractice}
                  onChange={(e) => handleInputChange("doulaPractice", e.target.value)}
                  placeholder="Birth Support Services"
                  className="mt-1 h-12 rounded-xl border-gray-200 focus:border-pink-400"
                  data-testid="input-doula-practice"
                />
              </div>
              
              <div>
                <Label htmlFor="doulaEmail" className="text-gray-600 text-sm">Email Address</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="doulaEmail"
                    type="email"
                    value={formData.doulaEmail}
                    onChange={(e) => handleInputChange("doulaEmail", e.target.value)}
                    placeholder="sarah@doula.com"
                    className="h-12 rounded-xl border-gray-200 focus:border-pink-400 flex-1"
                    data-testid="input-doula-email"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleLookupProvider('doula')}
                    disabled={isLookingUpProvider || !formData.doulaPractice}
                    className="h-12 w-12 rounded-xl border-pink-200 hover:bg-pink-50"
                  >
                    {isLookingUpProvider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            {!formData.noProviderYet && (
              <button 
                onClick={() => setShowNoProviderDisclaimer(true)}
                className="w-full py-3 text-gray-600 text-sm underline hover:text-pink-500 transition-colors"
                data-testid="button-no-provider"
              >
                I don't have a provider yet — help me get started
              </button>
            )}
            
            {formData.noProviderYet && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">No provider added</p>
                    <p className="text-xs text-amber-600 mt-1">
                      We'll help you find care. You can add a provider later in settings.
                    </p>
                    <button
                      onClick={() => handleInputChange("noProviderYet", false)}
                      className="text-xs text-pink-500 underline mt-2"
                      data-testid="button-add-provider-later"
                    >
                      Actually, I'd like to add my provider now
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => createUserMutation.mutate(formData)}
              disabled={!isStep7Valid || createUserMutation.isPending}
              className="w-full py-4 mt-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200"
              data-testid="button-create-profile"
            >
              {createUserMutation.isPending ? "Creating profile..." : "Continue"}
            </button>
          </div>
        )}

        {/* No Provider Disclaimer Dialog */}
        <Dialog open={showNoProviderDisclaimer} onOpenChange={setShowNoProviderDisclaimer}>
          <DialogContent className="max-w-md mx-4 rounded-3xl">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">Important Information</DialogTitle>
              <DialogDescription className="text-center pt-2">
                <span className="block text-gray-700 leading-relaxed">
                  Nia can guide you with educational support and wellness tools, but she is not a medical provider.
                </span>
                <span className="block mt-3 text-gray-700 font-medium">
                  For emergencies or concerning symptoms, call 911 or your local emergency number.
                </span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="bg-pink-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">We'll help you:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500">•</span>
                    Find local OBs and midwives in your area
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500">•</span>
                    Learn what to look for in a care provider
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500">•</span>
                    Add your provider once you choose one
                  </li>
                </ul>
              </div>
              
              <button
                onClick={() => {
                  handleInputChange("noProviderYet", true);
                  setShowNoProviderDisclaimer(false);
                }}
                className="w-full py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
                data-testid="button-accept-disclaimer"
              >
                I understand, continue
              </button>
              
              <button
                onClick={() => setShowNoProviderDisclaimer(false)}
                className="w-full py-3 text-gray-500 text-sm"
                data-testid="button-cancel-disclaimer"
              >
                Cancel
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {step === 8 && (
          <div className="text-center pt-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto bg-white border-4 border-pink-200 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <Heart className="w-10 h-10 text-red-500 fill-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              One more thing...
            </h2>
            
            {wantsPartnerInvite === null ? (
              <div className="space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  Would you like to invite your partner to stay connected with your journey?
                </p>
                <p className="text-gray-500 text-sm">
                  They'll see updates you choose to share
                </p>
                
                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => {
                      setWantsPartnerInvite(true);
                      if (userId) {
                        generateInviteCodeMutation.mutate({ motherId: userId });
                      }
                    }}
                    className="w-full py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
                    data-testid="button-invite-partner"
                  >
                    Yes, invite my partner
                  </button>
                  
                  <button 
                    onClick={() => {
                      setWantsPartnerInvite(false);
                      handlePartnerInviteComplete();
                    }}
                    className="w-full py-4 rounded-full text-lg font-semibold text-pink-500 border-2 border-pink-300 hover:bg-pink-50 transition-all"
                    data-testid="button-skip-invite"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {partnerInviteCode ? (
                  <>
                    <p className="text-gray-600 text-lg">
                      Share this code with your partner:
                    </p>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl p-6">
                      <p className="text-3xl font-bold text-gray-800 tracking-widest" data-testid="text-invite-code">
                        {partnerInviteCode}
                      </p>
                    </div>
                    
                    <p className="text-gray-500 text-sm">
                      This code expires in 7 days
                    </p>
                    
                    <button 
                      onClick={handlePartnerInviteComplete}
                      className="w-full py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
                      data-testid="button-continue-home"
                    >
                      Continue to Home
                    </button>
                  </>
                ) : (
                  <div className="py-8">
                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-4">Generating invite code...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
