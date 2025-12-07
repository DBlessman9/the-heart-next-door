import { useState, useEffect, useRef } from "react";
import { User, LogOut, Upload, MessageSquare, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";

interface AppHeaderProps {
  user: UserType;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackRating, setFeedbackRating] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getPregnancyInfo = () => {
    if (user.isPostpartum) {
      return "Postpartum Journey";
    }
    if (user.pregnancyWeek) {
      const getTrimester = (week: number) => {
        if (week <= 13) return "1st Trimester";
        if (week <= 27) return "2nd Trimester";
        return "3rd Trimester";
      };
      return `Week ${user.pregnancyWeek} • ${getTrimester(user.pregnancyWeek)}`;
    }
    return "Your Journey";
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUserId");
    setLocation("/onboarding");
  };

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("userId", user.id.toString());
      
      const response = await fetch("/api/user/upload-photo", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success!",
        description: "Your profile photo has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const feedbackMutation = useMutation({
    mutationFn: async (data: { feedback: string; category: string; rating: number }) => {
      return apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          feedback: data.feedback,
          category: data.category,
          rating: data.rating > 0 ? data.rating : undefined,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted.",
      });
      setFeedbackOpen(false);
      setFeedbackText("");
      setFeedbackCategory("general");
      setFeedbackRating(0);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      feedbackMutation.mutate({
        feedback: feedbackText,
        category: feedbackCategory,
        rating: feedbackRating,
      });
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize to max 400x400 while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Compress the image before uploading
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, {
          type: 'image/jpeg',
        });
        uploadPhotoMutation.mutate(compressedFile);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-deep-teal">
            {getGreeting()}, {user.firstName}
          </h2>
          <p className="text-sm text-gray-500">
            {getPregnancyInfo()}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="p-0 h-12 w-12 rounded-full overflow-hidden border-2 border-pink-300"
              style={{ backgroundColor: user.profilePhotoUrl ? 'transparent' : 'hsl(340, 70%, 75%)' }}
              data-testid="button-profile-menu"
            >
              {user.profilePhotoUrl ? (
                <img 
                  src={user.profilePhotoUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-white" size={20} />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handlePhotoUpload} className="cursor-pointer" data-testid="menu-upload-photo">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFeedbackOpen(true)} className="cursor-pointer" data-testid="menu-feedback">
              <MessageSquare className="mr-2 h-4 w-4" />
              Share Feedback
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" data-testid="menu-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          data-testid="input-photo-upload"
        />
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              We'd love to hear from you! Your feedback helps us improve.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                <SelectTrigger data-testid="select-feedback-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="praise">Compliment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Rating (optional)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(feedbackRating === star ? 0 : star)}
                    className="p-1 hover:scale-110 transition-transform"
                    data-testid={`button-rating-${star}`}
                  >
                    <Star
                      size={24}
                      className={star <= feedbackRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Your Feedback</Label>
              <Textarea
                placeholder="Tell us what's on your mind..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                data-testid="textarea-feedback"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)} data-testid="button-cancel-feedback">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFeedback} 
              disabled={!feedbackText.trim() || feedbackMutation.isPending}
              className="bg-blush hover:bg-blush/90"
              data-testid="button-submit-feedback"
            >
              {feedbackMutation.isPending ? "Sending..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
