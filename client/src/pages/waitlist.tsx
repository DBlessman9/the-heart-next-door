import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import maternalIcon from "@assets/generated_images/Pregnant_woman_bun_hairstyle_sage_272a5b6e.png";

export default function Waitlist() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage/10 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <img 
              src={maternalIcon} 
              alt="Maternal Icon" 
              className="w-32 h-32 object-contain animate-pulse"
            />
          </div>
        </div>

        <Card className="border-2 border-sage/20 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="mb-6">
              <Heart className="w-16 h-16 text-sage mx-auto mb-4" fill="currentColor" />
              <h1 className="text-3xl md:text-4xl font-bold text-deep-teal mb-4">
                Thanks for joining, mama!
              </h1>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="text-lg md:text-xl font-medium">
                You're officially on our <span className="text-sage font-bold">Founding Waitlist</span>.
              </p>
              
              <p className="text-base md:text-lg leading-relaxed">
                We'll notify you the moment The Heart Next Door expands to your area — because every mother deserves a village.
              </p>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  💛 In the meantime, we're building something special for Detroit-area moms. You'll be among the first to know when we're ready to welcome you home.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Keep an eye on your inbox — Nia can't wait to meet you.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-sm text-gray-500">
          Questions? We're here. Reach out to us anytime at{" "}
          <a 
            href="mailto:support@theheartnetxdoor.com" 
            className="text-sage hover:underline font-medium"
          >
            support@theheartnetxdoor.com
          </a>
        </p>
      </div>
    </div>
  );
}
