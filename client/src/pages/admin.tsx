import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, AlertCircle, Mail, Settings, LogOut, Heart } from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  pregnancyStage: string;
  userType: string;
  createdAt: string;
  waitlistUser: boolean;
}

export default function AdminPortal() {
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // Verify admin access
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setLocation("/");
    } else {
      setIsAdmin(true);
    }
  }, [setLocation]);

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("currentUserId");
    setLocation("/onboarding");
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blush/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-2xl font-bold text-deep-teal">Admin Portal</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card data-testid="card-total-users">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-deep-teal">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">Active mothers & partners</p>
              </CardContent>
            </Card>

            <Card data-testid="card-active-pregnancies">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Pregnancies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blush">{stats.activePregnancies}</div>
                <p className="text-xs text-gray-500 mt-1">Expecting mothers</p>
              </CardContent>
            </Card>

            <Card data-testid="card-red-flags">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Red Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats.redFlags}</div>
                <p className="text-xs text-gray-500 mt-1">Pending alerts</p>
              </CardContent>
            </Card>

            <Card data-testid="card-waitlist">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Waitlist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{stats.waitlistCount}</div>
                <p className="text-xs text-gray-500 mt-1">Outside Detroit area</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "users"
                ? "text-blush border-b-2 border-blush"
                : "text-gray-600 hover:text-gray-900"
            }`}
            data-testid="tab-users"
          >
            <Users className="inline w-4 h-4 mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "alerts"
                ? "text-blush border-b-2 border-blush"
                : "text-gray-600 hover:text-gray-900"
            }`}
            data-testid="tab-alerts"
          >
            <AlertCircle className="inline w-4 h-4 mr-2" />
            Red Flags
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "settings"
                ? "text-blush border-b-2 border-blush"
                : "text-gray-600 hover:text-gray-900"
            }`}
            data-testid="tab-settings"
          >
            <Settings className="inline w-4 h-4 mr-2" />
            Settings
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-users">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Stage</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(users as AdminUser[]).map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-blush/5" data-testid={`row-user-${user.id}`}>
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={user.userType === "mother" ? "default" : "secondary"}>
                            {user.userType}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.pregnancyStage || "N/A"}</td>
                        <td className="py-3 px-4">
                          {user.waitlistUser ? (
                            <Badge variant="outline">Waitlist</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Red Flags Tab */}
        {activeTab === "alerts" && (
          <Card>
            <CardHeader>
              <CardTitle>Red Flag Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 py-8 text-center">
                Red flag alerts will appear here when detected. Alerts are automatically sent to healthcare providers.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Email Service</h3>
                  <p className="text-sm text-gray-600">Configure SendGrid or Resend API keys for email notifications</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Red Flag Thresholds</h3>
                  <p className="text-sm text-gray-600">Customize alert triggers for maternal health monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
