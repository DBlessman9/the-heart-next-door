import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  Shield, 
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface EmailSignup {
  email: string;
  name?: string;
  dueDate?: string;
  source?: string;
}

export default function Landing() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async (data: EmailSignup) => {
      return apiRequest("POST", "/api/email-signups", {
        ...data,
        source: "landing_page",
        signupDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Welcome to the waitlist!",
        description: "We'll be in touch soon with early access details.",
      });
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      signupMutation.mutate({ email, name });
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: "AI Digital Doula",
      description: "24/7 personalized support from Nia, your AI companion trained on maternal wellness expertise",
    },
    {
      icon: Calendar,
      title: "Smart Check-ins",
      description: "Daily wellness tracking that adapts to your pregnancy journey and postpartum recovery",
    },
    {
      icon: BookOpen,
      title: "Expert Resources",
      description: "Curated educational content from certified doulas, lactation consultants, and wellness experts",
    },
    {
      icon: Users,
      title: "Partner Portal",
      description: "Connect your support person so they can be part of your wellness journey every step of the way",
    },
    {
      icon: Heart,
      title: "Holistic Wellness",
      description: "Journal prompts, mood tracking, and mindfulness tools designed specifically for maternal health",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is secure and private. You control what information is shared and with whom",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      location: "Brooklyn, NY",
      quote: "Having Nia available 24/7 during my pregnancy gave me so much peace of mind. It's like having a doula in your pocket.",
      stage: "32 weeks pregnant",
    },
    {
      name: "Jessica L.",
      location: "San Francisco, CA", 
      quote: "The partner portal was a game-changer. My husband finally understood what I was going through and how to support me.",
      stage: "New mom",
    },
    {
      name: "Maria R.",
      location: "Austin, TX",
      quote: "The daily check-ins helped me recognize patterns in my mood and energy. I felt so much more in tune with my body.",
      stage: "6 months postpartum",
    },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-sage-800 mb-2">You're on the list!</h2>
            <p className="text-sage-600 mb-6">
              Thank you for joining our early access waitlist. We'll send you updates as we prepare to launch.
            </p>
            <div className="bg-sage-50 rounded-lg p-4">
              <p className="text-sm text-sage-700">
                <strong>What's next?</strong><br />
                We'll be sending early access invites to our beta program soon. 
                Keep an eye on your inbox for exclusive updates and tips.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-sage-200 text-sage-800 hover:bg-sage-300">
            <Sparkles className="w-4 h-4 mr-1" />
            Early Access Available
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-sage-800 mb-6 leading-tight">
            Your Digital Village for
            <span className="block text-sage-600">Maternal Wellness</span>
          </h1>
          
          <p className="text-xl text-sage-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience pregnancy and postpartum with confidence. Get personalized support from your AI doula, 
            connect with experts, and track your wellness journey—all in one beautiful, secure platform.
          </p>

          {/* Email Signup Form */}
          <Card className="max-w-md mx-auto mb-12 bg-white border-sage-200">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-left">
                  <label className="text-sm font-medium text-sage-700 mb-2 block">
                    Your Name (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-sage-300 focus:border-sage-500"
                  />
                </div>
                
                <div className="text-left">
                  <label className="text-sm font-medium text-sage-700 mb-2 block">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-sage-300 focus:border-sage-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-sage-600 hover:bg-sage-700 text-white py-3"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Joining..." : "Get Early Access"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
              
              <p className="text-xs text-sage-500 mt-3 text-center">
                Join 2,000+ mothers already on our waitlist. No spam, ever.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-8 text-sm text-sage-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Clinically Informed
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Partner Inclusive
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sage-800 mb-4">
              Everything you need for your wellness journey
            </h2>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              From conception to postpartum, we're here to support you with tools that actually understand maternal health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-sage-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-sage-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-sage-800 mb-2">{feature.title}</h3>
                  <p className="text-sage-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-sage-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sage-800 mb-4">
              Loved by mothers everywhere
            </h2>
            <p className="text-lg text-sage-600">
              Real stories from real mothers who've used our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-sage-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sage-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-sage-800">{testimonial.name}</p>
                    <p className="text-sm text-sage-600">{testimonial.location}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {testimonial.stage}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-sage-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your maternal wellness journey?
          </h2>
          <p className="text-xl text-sage-100 mb-8">
            Join thousands of mothers who are already experiencing better pregnancy and postpartum care.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-sage-600 hover:bg-sage-50 px-8 py-4 text-lg"
            onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Early Access Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-sage-800 text-center">
        <div className="max-w-6xl mx-auto">
          <p className="text-sage-300 mb-2">
            Built with love for mothers and families everywhere
          </p>
          <p className="text-sage-400 text-sm">
            © 2025 Maternal Wellness App. Early access launching soon.
          </p>
        </div>
      </footer>
    </div>
  );
}