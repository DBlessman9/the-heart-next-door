import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heart, Users, Calendar } from "lucide-react";

const partnerOnboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  relationshipType: z.enum(["spouse", "partner", "other"]),
  inviteCode: z.string().min(6, "Invite code must be 6 characters").max(6),
});

type PartnerOnboardingData = z.infer<typeof partnerOnboardingSchema>;

export default function PartnerOnboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();

  const form = useForm<PartnerOnboardingData>({
    resolver: zodResolver(partnerOnboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      relationshipType: "spouse",
      inviteCode: "",
    },
  });

  // Check invite code validity
  const { data: partnership, isLoading: checkingCode } = useQuery({
    queryKey: ["/api/partnerships/code", form.watch("inviteCode")],
    enabled: form.watch("inviteCode").length === 6,
    retry: false,
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerOnboardingData) => {
      // First create the partner user account
      const partnerUser = await apiRequest("POST", "/api/users", {
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        userType: "partner",
      });

      // Accept the partnership
      if (partnership) {
        await apiRequest("POST", `/api/partnerships/${partnership.id}/accept`, {
          partnerId: partnerUser.id,
        });
      }

      return partnerUser;
    },
    onSuccess: (data) => {
      localStorage.setItem("currentUserId", data.id.toString());
      localStorage.setItem("userType", "partner");
      setLocation("/partner-dashboard");
    },
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = (data: PartnerOnboardingData) => {
    createPartnerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 to-blush-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-white border-4 border-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <CardTitle className="text-2xl text-blush-800">Join as a Partner</CardTitle>
          <p className="text-blush-600">Support your partner's wellness journey</p>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-3 h-3 rounded-full ${
                  stepNum <= step ? 'bg-blush-500' : 'bg-blush-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blush-700 mb-4">Let's get to know you</h3>
                  
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="w-full bg-blush-600 hover:bg-blush-700"
                    disabled={!form.watch("firstName") || !form.watch("lastName") || !form.watch("email")}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blush-700 mb-4">Your relationship</h3>

                  <FormField
                    control={form.control}
                    name="relationshipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am the...</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="other">Other supportive person</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleNext}
                      className="flex-1 bg-blush-600 hover:bg-blush-700"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blush-700 mb-4">Connect with your partner</h3>

                  <FormField
                    control={form.control}
                    name="inviteCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invite Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter 6-character code" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              field.onChange(value);
                            }}
                            maxLength={6}
                          />
                        </FormControl>
                        <FormMessage />
                        {checkingCode && (
                          <p className="text-sm text-blush-600">Checking code...</p>
                        )}
                        {partnership && (
                          <p className="text-sm text-green-600">✓ Valid invite code</p>
                        )}
                        {form.watch("inviteCode").length === 6 && !partnership && !checkingCode && (
                          <p className="text-sm text-red-600">Invalid invite code</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="text-sm text-blush-600 bg-blush-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Need an invite code?</p>
                    <p>Ask your partner to share their partner invite code from their app settings.</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-blush-600 hover:bg-blush-700"
                      disabled={!partnership || createPartnerMutation.isPending}
                    >
                      {createPartnerMutation.isPending ? "Creating account..." : "Join"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}