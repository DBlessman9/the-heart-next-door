import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Share2, Users, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PartnershipPermissions {
  canViewCheckIns: boolean;
  canViewJournal: boolean;
  canViewAppointments: boolean;
  canViewResources: boolean;
}

export default function PartnerInvitation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  
  const currentUserId = localStorage.getItem("currentUserId");
  const userId = currentUserId ? parseInt(currentUserId) : null;

  // Get existing partnership
  const { data: partnership } = useQuery({
    queryKey: ["/api/partnerships/mother", userId],
    enabled: !!userId,
  });

  const [permissions, setPermissions] = useState<PartnershipPermissions>({
    canViewCheckIns: partnership?.canViewCheckIns || false,
    canViewJournal: partnership?.canViewJournal || false,
    canViewAppointments: partnership?.canViewAppointments || true,
    canViewResources: partnership?.canViewResources || true,
  });

  const createPartnershipMutation = useMutation({
    mutationFn: async (relationshipType: string) => {
      return apiRequest("POST", "/api/partnerships", {
        motherId: userId,
        relationshipType,
        ...permissions
      });
    },
    onSuccess: () => {
      toast({
        title: "Partner invitation created!",
        description: "Share the invite code with your partner so they can join.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partnerships/mother", userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create partnership invitation.",
        variant: "destructive",
      });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (newPermissions: Partial<PartnershipPermissions>) => {
      if (!partnership) throw new Error("No partnership found");
      return apiRequest("PATCH", `/api/partnerships/${partnership.id}/permissions`, newPermissions);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your sharing preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partnerships/mother", userId] });
    },
  });

  const handlePermissionChange = (permission: keyof PartnershipPermissions, value: boolean) => {
    const newPermissions = { ...permissions, [permission]: value };
    setPermissions(newPermissions);
    
    if (partnership) {
      updatePermissionsMutation.mutate({ [permission]: value });
    }
  };

  const copyInviteCode = async () => {
    if (partnership?.inviteCode) {
      await navigator.clipboard.writeText(partnership.inviteCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareInviteLink = () => {
    const inviteLink = `${window.location.origin}/partner-onboarding?code=${partnership?.inviteCode}`;
    if (navigator.share) {
      navigator.share({
        title: "Join me on our wellness journey",
        text: "I'd love for you to be part of my pregnancy journey. Join me on the maternal wellness app!",
        url: inviteLink,
      });
    } else {
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Link copied!",
        description: "Invite link copied to clipboard",
      });
    }
  };

  return (
    <Card className="bg-white border-blush-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Partner Connection
        </CardTitle>
        <p className="text-sm text-blush-600">
          Invite your partner to join your wellness journey
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {partnership?.status === "active" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-800">Connected</p>
                <p className="text-sm text-green-600">
                  Your partner is connected and can access shared information
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        ) : partnership ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div>
                <p className="font-medium text-pink-800">Invitation Sent</p>
                <p className="text-sm text-pink-600">
                  Waiting for your partner to accept the invitation
                </p>
              </div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Share Invite Code</Label>
              <div className="flex gap-2">
                <Input 
                  value={partnership.inviteCode || ""} 
                  readOnly 
                  className="font-mono text-center text-lg tracking-widest"
                />
                <Button variant="outline" onClick={copyInviteCode}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={shareInviteLink}
                  className="flex-1"
                >
                  <Share2 size={16} className="mr-2" />
                  Share Link
                </Button>
              </div>
              <p className="text-xs text-blush-600">
                Send this code to your partner so they can connect their account to yours.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6">
              <Users className="w-12 h-12 text-blush-300 mx-auto mb-3" />
              <h3 className="font-medium text-blush-800 mb-2">Invite Your Partner</h3>
              <p className="text-sm text-blush-600 mb-4">
                Create a connection so your partner can support your wellness journey
              </p>
              <Button 
                onClick={() => createPartnershipMutation.mutate("spouse")}
                disabled={createPartnershipMutation.isPending}
                className="bg-blush-600 hover:bg-blush-700"
              >
                {createPartnershipMutation.isPending ? "Creating..." : "Create Invitation"}
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-blush-800">What your partner can see</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Daily Check-ins</Label>
                <p className="text-xs text-blush-600">
                  Share your daily wellness check-ins and mood updates
                </p>
              </div>
              <Switch
                checked={permissions.canViewCheckIns}
                onCheckedChange={(checked) => handlePermissionChange("canViewCheckIns", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Journal Entries</Label>
                <p className="text-xs text-blush-600">
                  Allow access to your private journal and reflections
                </p>
              </div>
              <Switch
                checked={permissions.canViewJournal}
                onCheckedChange={(checked) => handlePermissionChange("canViewJournal", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Appointments</Label>
                <p className="text-xs text-blush-600">
                  Share upcoming medical appointments and reminders
                </p>
              </div>
              <Switch
                checked={permissions.canViewAppointments}
                onCheckedChange={(checked) => handlePermissionChange("canViewAppointments", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Learning Resources</Label>
                <p className="text-xs text-blush-600">
                  Allow access to partner-specific educational content
                </p>
              </div>
              <Switch
                checked={permissions.canViewResources}
                onCheckedChange={(checked) => handlePermissionChange("canViewResources", checked)}
              />
            </div>
          </div>

          <div className="bg-blush-50 rounded-lg p-4">
            <p className="text-sm text-blush-600">
              <strong>Privacy Note:</strong> You can change these settings at any time. 
              Your partner will only see what you're comfortable sharing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}