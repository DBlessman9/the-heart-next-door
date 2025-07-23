import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Clock,
  BookOpen, 
  Users, 
  Shield, 
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Baby,
  Moon,
  Sun,
  ExternalLink,
  Headphones,
  BookText
} from "lucide-react";
// Logo will be added as SVG for now

interface EmailSignup {
  email: string;
  name?: string;
  userType?: string;
  dueDate?: string;
  source?: string;
}

export default function Landing() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("");
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
      signupMutation.mutate({ email, name, userType });
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Digital Doula",
      description: "24/7 personalized support from Nia, your digital companion trained on maternal wellness expertise",
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
      icon: Calendar,
      title: "Appointment Syncing",
      description: "Keep all your prenatal appointments, checkups, and consultations organized in one place with smart reminders",
    },
    {
      icon: Users,
      title: "Your Village",
      description: "Connect with local moms, join community groups, and build meaningful relationships based on location or shared experiences",
    },
    {
      icon: Heart,
      title: "Holistic Wellness",
      description: "Journal prompts, mood tracking, and mindfulness tools designed specifically for maternal health",
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
            
            <div className="space-y-6 mb-12">
              <p className="text-lg text-gray-600 font-medium mb-4">
                The healthtech platform redefining maternal care
              </p>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">
                  Your 24/7 support system
                </span>
                <br />
                <span className="text-gray-700">through pregnancy, postpartum, and beyond</span>
              </h1>
              
              <p className="text-2xl text-gray-700 font-light italic">
                Because every mother deserves a village.
              </p>
            </div>
          </div>

          {/* App Preview Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                <div className="relative bg-gradient-to-br from-sage-50 to-sage-100 rounded-2xl p-6 shadow-lg">
                  {/* App Mockup */}
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 flex items-center justify-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-sage-400 to-sage-500 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-sage-800 text-sm leading-tight">The Heart</div>
                          <div className="font-semibold text-sage-800 text-sm leading-tight">Next Door</div>
                        </div>
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
                          <div className="relative">
                            <div className="w-6 h-6 bg-sage-500 rounded-full flex items-center justify-center">
                              <MessageCircle className="w-3 h-3 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
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
                          <Users className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                          <p className="text-xs text-amber-700 font-medium">Experts</p>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-medium text-purple-700">Your Learning Journey</span>
                        </div>
                        <div className="text-xs text-purple-600">
                          Progress: Week 24 • 3 modules completed this week
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
                  <h3 className="text-2xl font-bold text-gray-800 ml-4">Meet Nia, Your Digital Doula</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Available 24/7 to answer questions, provide emotional support, and guide you through 
                  every step of your maternal wellness journey with personalized, evidence-based advice.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 ml-4">Smart Wellness Tracking</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Daily check-ins, journaling, and wellness insights that adapt to your unique 
                  pregnancy and postpartum journey.
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
                      I am a...
                    </label>
                    <Select value={userType} onValueChange={setUserType}>
                      <SelectTrigger className="border-gray-200 focus:border-rose-400 focus:ring-rose-400/20 h-12 text-base">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pregnant">Pregnant</SelectItem>
                        <SelectItem value="postpartum">Postpartum</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="birthworker">Birth Worker</SelectItem>
                        <SelectItem value="healthcare">Healthcare Provider</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
              Everything you need to feel seen, supported, and strong.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From conception to postpartum, we offer tools that honor your body, mind, and heart.
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

      {/* Personal Letter Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-100/50 via-orange-100/50 to-amber-100/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Built by Moms, for Moms
            </h2>
            <p className="text-xl text-gray-600">
              A Letter from our Founder
            </p>
          </div>

          <Card className="bg-white/90 backdrop-blur border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  Dear Mama,
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  I know what it feels like to be awake at 3 AM—aching with exhaustion, craving connection, and wondering if anyone else has ever felt what you're feeling. I know the silence that surrounds our pain, the questions that go unanswered, and the invisible weight we carry. Motherhood asks so much of us. And yet, we give and give—often without having a safe place to land ourselves.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  When I faced a high-risk pregnancy and traumatic birth I found myself grasping for peace, for clarity, for community. That experience changed me. It's what led me to write Waking Up to Grace, my story of survival, surrender, and strength in the face of a maternal health system that too often overlooks us.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  Since sharing my journey, I've sat in rooms and forums with hundreds of mothers—listening to their stories, hearing their heartbreaks, and recognizing our shared longing: to feel seen, supported, and safe.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  That's why I created The Heart Next Door—not just an app, but an answer. A digital sanctuary designed to meet the real needs of motherhood with empathy, expertise, and around-the-clock care. It's the village we've been told no longer exists—now built with intention, innovation, and heart.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  This platform is the digital doula I needed. The around-the-clock support I prayed for. The safe haven I promised I'd create—for me, for you, for all of us.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                  Wherever you are in your motherhood journey, welcome home.
                </p>
                
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 font-semibold text-xl mb-2">With love and gratitude,</p>
                      <div className="text-2xl font-medium text-gray-800 mb-2" style={{fontFamily: 'cursive'}}>
                        Terranie Clarke
                      </div>
                      <p className="text-gray-600">Founder, The Heart Next Door</p>
                    </div>
                    <div className="hidden md:block">
                      <div className="w-24 h-24 bg-gradient-to-br from-rose-200 to-orange-200 rounded-full flex items-center justify-center">
                        <Heart className="w-10 h-10 text-rose-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6 text-lg">Connect with me and learn more:</p>
            <div className="flex justify-center gap-6 flex-wrap">
              <Button 
                variant="outline" 
                className="bg-white/80 hover:bg-white border-gray-200 hover:border-rose-300 hover:text-rose-600 transition-all duration-200"
                asChild
              >
                <a href="#" className="flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  Listen to My Podcast
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white/80 hover:bg-white border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-all duration-200"
                asChild
              >
                <a href="#" className="flex items-center gap-2">
                  <BookText className="w-4 h-4" />
                  Read My Books
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white/80 hover:bg-white border-gray-200 hover:border-amber-300 hover:text-amber-600 transition-all duration-200"
                asChild
              >
                <a href="#" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Follow on Social
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
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
            <span className="text-2xl font-bold text-white ml-3">The Heart Next Door</span>
          </div>
          <p className="text-gray-300 mb-4 text-lg">
            Built with love for mothers and families everywhere
          </p>
          <p className="text-gray-400">
            © 2025 The Heart Next Door. Early access launching soon.
          </p>
        </div>
      </footer>
    </div>
  );
}