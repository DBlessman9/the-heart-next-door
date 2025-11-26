import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Baby, Heart, Brain, Sparkles, Target, BookOpen, AlertCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@shared/schema";

interface WeeklyGuidance {
  week: number;
  trimester: number;
  babySize: {
    fruit: string;
    emoji: string;
    size: string;
  };
  babyMilestones: string[];
  momInsights: string[];
  emotionalSupport: string;
  learningContent: {
    title: string;
    description: string;
    category: string;
  };
}

// Comprehensive weekly guidance data
const weeklyGuidanceData: WeeklyGuidance[] = [
  {
    week: 4,
    trimester: 1,
    babySize: { fruit: "Poppy seed", emoji: "🌰", size: "2mm" },
    babyMilestones: [
      "Neural tube is forming",
      "Heart begins to develop",
      "Placenta starts to form"
    ],
    momInsights: [
      "You might notice breast tenderness",
      "Fatigue is common as your body works hard",
      "Mood swings are normal due to hormonal changes"
    ],
    emotionalSupport: "You're embarking on an incredible journey. Your body is already working miracles, even if you can't feel it yet. Trust the process.",
    learningContent: {
      title: "Understanding Early Pregnancy Symptoms",
      description: "Learn what's happening in your body during these crucial first weeks",
      category: "early-pregnancy"
    }
  },
  {
    week: 8,
    trimester: 1,
    babySize: { fruit: "Raspberry", emoji: "🫐", size: "16mm" },
    babyMilestones: [
      "All major organs are forming",
      "Tiny fingers and toes appear",
      "Baby's face is taking shape"
    ],
    momInsights: [
      "Morning sickness may peak around now",
      "Food aversions are completely normal",
      "You might feel more emotional than usual"
    ],
    emotionalSupport: "Every wave of nausea is your body protecting and nurturing your baby. You're stronger than you know.",
    learningContent: {
      title: "Managing Morning Sickness",
      description: "Natural remedies and tips to help you feel better",
      category: "symptoms"
    }
  },
  {
    week: 12,
    trimester: 1,
    babySize: { fruit: "Plum", emoji: "🌸", size: "5.4cm" },
    babyMilestones: [
      "All major organs are formed",
      "Baby can swallow and make urine",
      "Vocal cords are developing"
    ],
    momInsights: [
      "Morning sickness often improves",
      "Energy levels may start to return",
      "You might notice your clothes fitting differently"
    ],
    emotionalSupport: "You've made it through the most critical development period. Your baby is growing beautifully, and so are you as a mother.",
    learningContent: {
      title: "Your First Trimester Recap",
      description: "Celebrate how far you've come and what's ahead",
      category: "milestones"
    }
  },
  {
    week: 16,
    trimester: 2,
    babySize: { fruit: "Avocado", emoji: "🥑", size: "11.6cm" },
    babyMilestones: [
      "Baby can hear your voice now!",
      "Facial muscles are developing",
      "Baby is practicing breathing movements"
    ],
    momInsights: [
      "You might feel the first flutters of movement",
      "Skin changes like darkening nipples are normal",
      "Your appetite is likely returning"
    ],
    emotionalSupport: "Your baby can hear you now - every word of love you speak is being received. You're creating their first memories together.",
    learningContent: {
      title: "Bonding with Your Baby",
      description: "Ways to connect with your baby before birth",
      category: "bonding"
    }
  },
  {
    week: 20,
    trimester: 2,
    babySize: { fruit: "Banana", emoji: "🍌", size: "16.4cm" },
    babyMilestones: [
      "Baby can hear outside sounds",
      "Fingerprints are forming",
      "Baby is developing sleep patterns"
    ],
    momInsights: [
      "You're likely feeling regular movements now",
      "Round ligament pain is common",
      "Your center of gravity is starting to shift"
    ],
    emotionalSupport: "You're halfway there! Your body is doing exactly what it needs to do. Every kick is a love letter from your baby.",
    learningContent: {
      title: "Anatomy Scan and Development",
      description: "Understanding your 20-week ultrasound",
      category: "development"
    }
  },
  {
    week: 24,
    trimester: 2,
    babySize: { fruit: "Corn", emoji: "🌽", size: "21cm" },
    babyMilestones: [
      "Baby's hearing is fully developed",
      "Lungs are developing rapidly",
      "Baby can recognize your voice"
    ],
    momInsights: [
      "You might experience leg cramps",
      "Braxton Hicks contractions may begin",
      "Back pain is common as your belly grows"
    ],
    emotionalSupport: "Your baby knows your voice and finds comfort in it. You're already providing safety and love in the most beautiful way.",
    learningContent: {
      title: "Preparing for the Third Trimester",
      description: "What to expect in the coming weeks",
      category: "preparation"
    }
  },
  {
    week: 28,
    trimester: 3,
    babySize: { fruit: "Eggplant", emoji: "🍆", size: "25cm" },
    babyMilestones: [
      "Baby's eyes can open and close",
      "Brain development accelerates",
      "Baby can distinguish between light and dark"
    ],
    momInsights: [
      "You might feel short of breath",
      "Heartburn is common",
      "Your belly button may pop out"
    ],
    emotionalSupport: "You're in the final stretch! Your baby is getting stronger every day, and so is your bond. You're growing into yourself as a mother.",
    learningContent: {
      title: "Third Trimester Comfort Tips",
      description: "Managing common discomforts in late pregnancy",
      category: "comfort"
    }
  },
  {
    week: 32,
    trimester: 3,
    babySize: { fruit: "Coconut", emoji: "🥥", size: "28cm" },
    babyMilestones: [
      "Baby's bones are hardening",
      "Immune system is developing",
      "Baby can dream now"
    ],
    momInsights: [
      "You might feel increased pressure",
      "Frequent urination returns",
      "Stretch marks may appear"
    ],
    emotionalSupport: "Your baby is dreaming - possibly about you! Every stretch mark is a testament to the miracle your body is creating.",
    learningContent: {
      title: "Preparing Your Hospital Bag",
      description: "Essential items for labor and delivery",
      category: "preparation"
    }
  },
  {
    week: 36,
    trimester: 3,
    babySize: { fruit: "Honeydew", emoji: "🍈", size: "32cm" },
    babyMilestones: [
      "Baby is considered full-term soon",
      "Lungs are nearly mature",
      "Baby is practicing breathing"
    ],
    momInsights: [
      "You might feel baby 'drop' into position",
      "Nesting instinct may kick in",
      "Braxton Hicks may become more frequent"
    ],
    emotionalSupport: "Your body knows exactly what to do. You've brought your baby this far - trust in your strength and your instincts.",
    learningContent: {
      title: "Signs of Labor",
      description: "How to know when it's time to go to the hospital",
      category: "labor"
    }
  },
  {
    week: 40,
    trimester: 3,
    babySize: { fruit: "Watermelon", emoji: "🍉", size: "35cm" },
    babyMilestones: [
      "Baby is ready to be born",
      "All systems are mature",
      "Baby has settled into birth position"
    ],
    momInsights: [
      "You might feel anxious about labor",
      "Energy levels can fluctuate",
      "Every day brings you closer to meeting your baby"
    ],
    emotionalSupport: "You've grown a human being from nothing. You are incredible, powerful, and ready for this next chapter. Trust your body.",
    learningContent: {
      title: "Labor and Delivery Guide",
      description: "Everything you need to know about bringing your baby earthside",
      category: "labor"
    }
  }
];

export default function BabyGuidance({ userId, user, onTabChange }: BabyGuidanceProps) {
  const currentWeek = user.pregnancyWeek || 20;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [showBabyNames, setShowBabyNames] = useState(false);
  const [showBirthPlan, setShowBirthPlan] = useState(false);
  
  // Find the guidance for the selected week or closest available
  const guidance = weeklyGuidanceData.find(g => g.week === selectedWeek) || 
                   weeklyGuidanceData.find(g => g.week <= selectedWeek) ||
                   weeklyGuidanceData[0];

  const { data: resources } = useQuery({
    queryKey: ["/api/resources", user.pregnancyStage],
    enabled: !!user.pregnancyStage,
  });

  const goToPrevWeek = () => {
    const currentIndex = weeklyGuidanceData.findIndex(g => g.week === selectedWeek);
    if (currentIndex > 0) {
      setSelectedWeek(weeklyGuidanceData[currentIndex - 1].week);
    }
  };

  const goToNextWeek = () => {
    const currentIndex = weeklyGuidanceData.findIndex(g => g.week === selectedWeek);
    if (currentIndex < weeklyGuidanceData.length - 1) {
      setSelectedWeek(weeklyGuidanceData[currentIndex + 1].week);
    }
  };

  const isCurrentWeek = selectedWeek === currentWeek;

  return (
    <div className="p-4 space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevWeek}
          disabled={selectedWeek === weeklyGuidanceData[0].week}
        >
          <ChevronLeft size={16} />
        </Button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-deep-teal">Week {selectedWeek}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Trimester {guidance.trimester}</span>
            {isCurrentWeek && <Badge variant="secondary">Current</Badge>}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          disabled={selectedWeek === weeklyGuidanceData[weeklyGuidanceData.length - 1].week}
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Baby Size and Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="text-blush" size={20} />
            Your Baby This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Baby Size */}
          <div className="text-center p-4 bg-blush/10 rounded-lg">
            <div className="text-4xl mb-2">{guidance.babySize.emoji}</div>
            <p className="font-semibold text-deep-teal">Size of a {guidance.babySize.fruit}</p>
            <p className="text-sm text-muted-foreground">{guidance.babySize.size}</p>
          </div>

          {/* Baby Milestones */}
          <div>
            <h4 className="font-semibold text-deep-teal mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-blush" />
              Amazing Developments
            </h4>
            <ul className="space-y-2">
              {guidance.babyMilestones.map((milestone, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blush rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{milestone}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Mom's Body Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="text-rose-500" size={20} />
            Your Body This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {guidance.momInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Planning Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-blush" size={20} />
            Planning Tools
          </CardTitle>
          <p className="text-sm text-muted-foreground">Helpful tools for your journey ahead</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setShowBabyNames(true)}
              data-testid="button-baby-names"
            >
              <Baby className="h-6 w-6" />
              <span className="text-sm">Baby Names</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setShowBirthPlan(true)}
              data-testid="button-birth-plan"
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Birth Plan</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => window.open('https://www.cdc.gov/hearher/maternal-warning-signs/index.html', '_blank')}
              data-testid="button-red-flags"
            >
              <AlertCircle className="h-6 w-6 text-red-500" />
              <span className="text-sm">Red Flags</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access to Current Week */}
      {!isCurrentWeek && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setSelectedWeek(currentWeek)}
            className="text-blush border-blush hover:bg-blush/10"
          >
            Return to Week {currentWeek}
          </Button>
        </div>
      )}

      {/* Baby Names Dialog */}
      <Dialog open={showBabyNames} onOpenChange={setShowBabyNames}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Baby className="text-blush" />
              Baby Name Ideas
            </DialogTitle>
            <DialogDescription>
              Popular and meaningful names to inspire you
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-deep-teal mb-3">Popular Girls' Names</h3>
              <div className="grid grid-cols-2 gap-3">
                {["Olivia", "Emma", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia"].map((name) => (
                  <div key={name} className="p-3 bg-rose-50 rounded-lg">
                    <p className="font-medium">{name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-deep-teal mb-3">Popular Boys' Names</h3>
              <div className="grid grid-cols-2 gap-3">
                {["Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas"].map((name) => (
                  <div key={name} className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">{name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-deep-teal mb-3">Gender-Neutral Names</h3>
              <div className="grid grid-cols-2 gap-3">
                {["Avery", "Riley", "Jordan", "Taylor", "Morgan", "Casey", "Quinn", "Sage"].map((name) => (
                  <div key={name} className="p-3 bg-lavender rounded-lg">
                    <p className="font-medium">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Birth Plan Dialog */}
      <Dialog open={showBirthPlan} onOpenChange={setShowBirthPlan}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="text-blush" />
              Birth Plan Guide
            </DialogTitle>
            <DialogDescription>
              Key decisions to discuss with your healthcare provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-deep-teal">During Labor</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="movement" />
                  <label htmlFor="movement" className="text-sm">I want freedom to move and change positions</label>
                </div>
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="hydration" />
                  <label htmlFor="hydration" className="text-sm">I want to eat/drink as desired</label>
                </div>
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="music" />
                  <label htmlFor="music" className="text-sm">I want to play my own music</label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-deep-teal">Pain Management</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="epidural" />
                  <label htmlFor="epidural" className="text-sm">I'm open to an epidural</label>
                </div>
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="natural" />
                  <label htmlFor="natural" className="text-sm">I prefer natural pain management techniques</label>
                </div>
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="water" />
                  <label htmlFor="water" className="text-sm">I'd like to use a birthing tub if available</label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-deep-teal">After Birth</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="skin-to-skin" />
                  <label htmlFor="skin-to-skin" className="text-sm">Immediate skin-to-skin contact</label>
                </div>
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="delayed-cord" />
                  <label htmlFor="delayed-cord" className="text-sm">Delayed cord clamping</label>
                </div>
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox id="breastfeed" />
                  <label htmlFor="breastfeed" className="text-sm">I want to try breastfeeding right away</label>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}