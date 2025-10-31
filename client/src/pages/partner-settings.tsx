import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Shield, Share2, Bell, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PartnershipPermissions {
  canViewCheckIns: boolean;
  canViewJournal: boolean;
  canViewAppointments: boolean;
  canViewResources: boolean;
}

export default function PartnerSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const currentUserId = localStorage.getItem("currentUserId");
  const partnerId = currentUserId ? parseInt(currentUserId) : null;

  // Get current partnership and permissions
  const { data: partnership } = useQuery({
    queryKey: ["/api/partnerships/user", partnerId],
    enabled: !!partnerId,
  });

  const [permissions, setPermissions] = useState<PartnershipPermissions>({
    canViewCheckIns: partnership?.canViewCheckIns || false,
    canViewJournal: partnership?.canViewJournal || false,
    canViewAppointments: partnership?.canViewAppointments || true,
    canViewResources: partnership?.canViewResources || true,
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (newPermissions: Partial<PartnershipPermissions>) => {
      if (!partnership) throw new Error("No partnership found");
      return apiRequest("PATCH", `/api/partnerships/${partnership.id}/permissions`, newPermissions);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partnerships/user", partnerId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePermissionChange = (permission: keyof PartnershipPermissions, value: boolean) => {
    const newPermissions = { ...permissions, [permission]: value };
    setPermissions(newPermissions);
    updatePermissionsMutation.mutate({ [permission]: value });
  };

  const generateInviteCode = () => {
    // This would typically generate a new invite code
    return "ABC123";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 to-blush-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/partner-dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>

        <Card className="bg-white border-blush-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Partner Settings
            </CardTitle>
            <p className="text-sm text-blush-600">
              Manage your account and privacy preferences
            </p>
          </CardHeader>
        </Card>

        {/* Privacy & Permissions */}
        <Card className="bg-white border-blush-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Permissions
            </CardTitle>
            <p className="text-sm text-blush-600">
              Control what information you can access from your partner's account
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">View Daily Check-ins</Label>
                  <p className="text-xs text-blush-600">
                    See how your partner is feeling and their wellness updates
                  </p>
                </div>
                <Switch
                  checked={permissions.canViewCheckIns}
                  onCheckedChange={(checked) => handlePermissionChange("canViewCheckIns", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">View Journal Entries</Label>
                  <p className="text-xs text-blush-600">
                    Access private journal entries and reflections
                  </p>
                </div>
                <Switch
                  checked={permissions.canViewJournal}
                  onCheckedChange={(checked) => handlePermissionChange("canViewJournal", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">View Appointments</Label>
                  <p className="text-xs text-blush-600">
                    See upcoming medical appointments and reminders
                  </p>
                </div>
                <Switch
                  checked={permissions.canViewAppointments}
                  onCheckedChange={(checked) => handlePermissionChange("canViewAppointments", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Access Learning Resources</Label>
                  <p className="text-xs text-blush-600">
                    View and complete partner-specific educational content
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
                <strong>Note:</strong> These permissions can be changed at any time by either you or your partner. 
                Open communication about boundaries is important for a healthy relationship.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="bg-white border-blush-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {partnership ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800">Connected</p>
                  <p className="text-sm text-green-600">
                    You're connected and sharing your wellness journey
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-yellow-800">Pending Connection</p>
                  <p className="text-sm text-yellow-600">
                    Waiting for your partner to accept the connection
                  </p>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-medium">Share Your Invite Code</Label>
              <div className="flex gap-2">
                <Input 
                  value={partnership?.inviteCode || generateInviteCode()} 
                  readOnly 
                  className="font-mono"
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(partnership?.inviteCode || generateInviteCode());
                    toast({
                      title: "Copied!",
                      description: "Invite code copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-blush-600">
                Share this code with your partner so they can connect their account to yours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white border-blush-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Daily Check-in Reminders</Label>
                <p className="text-xs text-blush-600">
                  Get notified when your partner completes their daily check-in
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Appointment Reminders</Label>
                <p className="text-xs text-blush-600">
                  Receive reminders about upcoming appointments
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Learning Suggestions</Label>
                <p className="text-xs text-blush-600">
                  Get suggestions for new partner resources and courses
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-white border-blush-200">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Download My Data
            </Button>
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
              Disconnect Partnership
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}