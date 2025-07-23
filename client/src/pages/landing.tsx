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
  Sparkles,
  Baby,
  Moon,
  Sun
} from "lucide-react";
// App screenshot will be added as a styled placeholder for now

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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-rose-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-orange-300/20 to-amber-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-8 bg-gradient-to-r from-rose-100 to-orange-100 text-rose-800 hover:from-rose-200 hover:to-orange-200 px-6 py-3 text-base font-medium rounded-full shadow-lg border-0">
              <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
              Early Access Available
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-gray-800">Your Digital</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">
                Village
              </span>
              <br />
              <span className="text-gray-700 text-4xl md:text-5xl">for Motherhood</span>
            </h1>
            
            <p className="text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Experience pregnancy and postpartum with confidence. Get personalized support from your AI doula, 
              connect with experts, and track your wellness journey—all in one beautiful, secure platform.
            </p>
          </div>

          {/* App Preview Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                <div className="relative bg-gradient-to-br from-sage-50 to-sage-100 rounded-2xl p-6 shadow-lg">
                  {/* App Mockup */}
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-sage-400 to-sage-500 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-sage-800">Maternal Wellness</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-sage-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-sage-500 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-sage-700">Nia, Your Digital Doula</span>
                        </div>
                        <p className="text-xs text-sage-600">Good morning! How are you feeling today? I'm here to support you through your wellness journey.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-rose-50 rounded-lg p-3 text-center">
                          <Calendar className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                          <p className="text-xs text-rose-700 font-medium">Daily Check-in</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                          <BookOpen className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                          <p className="text-xs text-amber-700 font-medium">Resources</p>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-medium text-orange-700">Partner Portal Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-orange-200 rounded-full"></div>
                          <span className="text-xs text-orange-600">Sarah is connected and following your journey</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 ml-4">Meet Nia, Your AI Doula</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Available 24/7 to answer questions, provide emotional support, and guide you through 
                  every step of your maternal wellness journey with personalized, evidence-based advice.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 ml-4">Partner Portal</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Connect your support person so they can understand your journey and provide 
                  meaningful support when you need it most.
                </p>
              </div>
            </div>
          </div>

          {/* Email Signup Form */}
          <div className="max-w-lg mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Join the Waitlist</h2>
              <p className="text-gray-600 text-lg">Be the first to experience the future of maternal wellness</p>
            </div>
            
            <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur border-0 shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-left">
                    <label className="text-base font-medium text-gray-700 mb-3 block">
                      Your Name (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gray-200 focus:border-rose-400 focus:ring-rose-400/20 h-12 text-base"
                    />
                  </div>
                  
                  <div className="text-left">
                    <label className="text-base font-medium text-gray-700 mb-3 block">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-200 focus:border-rose-400 focus:ring-rose-400/20 h-12 text-base"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:via-orange-600 hover:to-amber-600 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Joining...
                      </div>
                    ) : (
                      <>
                        Get Early Access
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Join 2,000+ mothers already on our waitlist. No spam, ever.
                  </p>
                  
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      HIPAA Compliant
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Clinically Informed
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      Partner Inclusive
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-white via-rose-50/30 to-orange-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Everything you need for your wellness journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From conception to postpartum, we're here to support you with tools that actually understand maternal health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const colors = [
                "from-rose-400 to-pink-400",
                "from-orange-400 to-amber-400", 
                "from-amber-400 to-yellow-400",
                "from-rose-400 to-orange-400",
                "from-pink-400 to-rose-400",
                "from-green-400 to-emerald-400"
              ];
              
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${colors[index]} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-100/50 via-orange-100/50 to-amber-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Loved by mothers everywhere
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real mothers who've used our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const gradients = [
                "from-rose-500/10 to-pink-500/10",
                "from-orange-500/10 to-amber-500/10", 
                "from-amber-500/10 to-yellow-500/10"
              ];
              
              return (
                <Card key={index} className={`bg-gradient-to-br ${gradients[index]} border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur`}>
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="border-t border-gray-200/50 pt-4">
                      <div className="font-semibold text-gray-800 text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {testimonial.location}
                      </div>
                      <div className="inline-block mt-2 px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700">
                        {testimonial.stage}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to transform your maternal wellness journey?
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of mothers who are already experiencing better pregnancy and postpartum care.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-rose-600 hover:bg-gray-50 px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Early Access Now
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gradient-to-br from-gray-800 to-gray-900 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white ml-3">Maternal Wellness</span>
          </div>
          <p className="text-gray-300 mb-4 text-lg">
            Built with love for mothers and families everywhere
          </p>
          <p className="text-gray-400">
            © 2025 Maternal Wellness App. Early access launching soon.
          </p>
        </div>
      </footer>
    </div>
  );
}