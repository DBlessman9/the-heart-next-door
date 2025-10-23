import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Users, MapPin, Calendar, Plus, Search, Send, ExternalLink, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Group, GroupMessage } from "@shared/schema";

interface CommunityProps {
  userId: number;
  user: User;
}

interface GroupWithDetails extends Group {
  latestMessage?: GroupMessage;
  userMembership?: boolean;
}

export default function Community({ userId, user }: CommunityProps) {
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [createGroupData, setCreateGroupData] = useState({
    name: "",
    description: "",
    type: "topic",
    zipCode: "",
    dueDate: "",
    topic: "",
    isPrivate: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's groups
  const { data: userGroups = [] } = useQuery({
    queryKey: ["/api/community/my-groups", userId],
    enabled: !!userId,
  });

  // Fetch available groups
  const { data: availableGroups = [] } = useQuery({
    queryKey: ["/api/community/groups"],
    enabled: activeTab === "discover",
  });

  // Fetch group messages
  const { data: groupMessages = [] } = useQuery({
    queryKey: ["/api/community/messages", selectedGroup?.id],
    enabled: !!selectedGroup?.id && isGroupChatOpen,
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      return await apiRequest(`/api/community/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/my-groups", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/groups"] });
      toast({
        title: "Joined Group",
        description: "You've successfully joined the group!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/community/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, createdBy: userId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/my-groups", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/groups"] });
      toast({
        title: "Group Created",
        description: "Your group has been created successfully!",
      });
      setIsCreateDialogOpen(false);
      setCreateGroupData({
        name: "",
        description: "",
        type: "topic",
        zipCode: "",
        dueDate: "",
        topic: "",
        isPrivate: false,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/community/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup?.id,
          userId,
          content: message,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/messages", selectedGroup?.id] });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case "location":
        return <MapPin size={16} className="text-sage" />;
      case "birth_month":
        return <Calendar size={16} className="text-sage" />;
      case "topic":
        return <MessageSquare size={16} className="text-sage" />;
      default:
        return <Users size={16} className="text-sage" />;
    }
  };

  const getGroupTypeLabel = (type: string) => {
    switch (type) {
      case "location":
        return "Location";
      case "birth_month":
        return "Birth Month";
      case "topic":
        return "Topic";
      default:
        return "General";
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    createGroupMutation.mutate(createGroupData);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const filteredGroups = availableGroups.filter((group: GroupWithDetails) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || group.type === filterType;
    return matchesSearch && matchesType;
  });

  // Group Chat Dialog
  const GroupChatDialog = () => (
    <Dialog open={isGroupChatOpen} onOpenChange={setIsGroupChatOpen}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getGroupTypeIcon(selectedGroup?.type || "")}
            {selectedGroup?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4 border rounded-lg">
            <div className="space-y-4">
              {groupMessages.map((message: GroupMessage & { userName?: string }) => (
                <div key={message.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-sage/20 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-sage" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.userName || 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {groupMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send size={16} />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Create Group Dialog
  const CreateGroupDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={createGroupData.name}
              onChange={(e) => setCreateGroupData({...createGroupData, name: e.target.value})}
              placeholder="e.g., Brooklyn Moms July 2025"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={createGroupData.description}
              onChange={(e) => setCreateGroupData({...createGroupData, description: e.target.value})}
              placeholder="What's this group about?"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="type">Group Type</Label>
            <Select value={createGroupData.type} onValueChange={(value) => setCreateGroupData({...createGroupData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="location">Location-based</SelectItem>
                <SelectItem value="birth_month">Birth Month</SelectItem>
                <SelectItem value="topic">Topic/Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {createGroupData.type === "location" && (
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={createGroupData.zipCode}
                onChange={(e) => setCreateGroupData({...createGroupData, zipCode: e.target.value})}
                placeholder="e.g., 11201"
              />
            </div>
          )}
          
          {createGroupData.type === "birth_month" && (
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={createGroupData.dueDate}
                onChange={(e) => setCreateGroupData({...createGroupData, dueDate: e.target.value})}
              />
            </div>
          )}
          
          {createGroupData.type === "topic" && (
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Select value={createGroupData.topic} onValueChange={(value) => setCreateGroupData({...createGroupData, topic: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breastfeeding">Breastfeeding</SelectItem>
                  <SelectItem value="nicu">NICU Support</SelectItem>
                  <SelectItem value="vbac">VBAC</SelectItem>
                  <SelectItem value="postpartum">Postpartum Depression</SelectItem>
                  <SelectItem value="single-mom">Single Moms</SelectItem>
                  <SelectItem value="multiples">Twins/Multiples</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-sage hover:bg-sage/90">
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-deep-teal mb-2">The Village</h2>
        <p className="text-gray-600 text-sm">Connect with other moms and resources in your community</p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover">Discover Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups ({userGroups.length})</TabsTrigger>
        </TabsList>

        {/* Discover Groups Tab */}
        <TabsContent value="discover" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="resource">Detroit Resources</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="birth_month">Birth Month</SelectItem>
                <SelectItem value="topic">Topic</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-sage hover:bg-sage/90">
              <Plus size={16} className="mr-2" />
              Create
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredGroups.map((group: GroupWithDetails) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getGroupTypeIcon(group.type)}
                        <h3 className="font-semibold">{group.name}</h3>
                        {group.isExternal && (
                          <Badge variant="outline" className="text-xs bg-sage/10 text-sage border-sage/20">
                            Resource
                          </Badge>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                      )}
                      {group.isExternal && (group.contactEmail || group.contactPhone) && (
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                          {group.contactPhone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {group.contactPhone}
                            </span>
                          )}
                          {group.contactEmail && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {group.contactEmail}
                            </span>
                          )}
                        </div>
                      )}
                      {!group.isExternal && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {group.memberCount} members
                          </span>
                          {group.latestMessage && (
                            <span>Last activity: {format(new Date(group.latestMessage.createdAt), 'MMM d')}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {group.isExternal && group.website ? (
                      <Button
                        onClick={() => window.open(group.website, '_blank')}
                        size="sm"
                        className="bg-sage hover:bg-sage/90"
                        data-testid={`button-visit-${group.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <ExternalLink size={14} className="mr-2" />
                        Visit Website
                      </Button>
                    ) : (
                      <Button
                        onClick={() => joinGroupMutation.mutate(group.id)}
                        size="sm"
                        variant="outline"
                        disabled={group.userMembership}
                        data-testid={`button-join-${group.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {group.userMembership ? 'Joined' : 'Join'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredGroups.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">No groups found</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4 bg-sage hover:bg-sage/90">
                    Create the first group
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* My Groups Tab */}
        <TabsContent value="my-groups" className="space-y-4">
          <div className="grid gap-4">
            {userGroups.map((group: GroupWithDetails) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getGroupTypeIcon(group.type)}
                        <h3 className="font-semibold">{group.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {getGroupTypeLabel(group.type)}
                        </Badge>
                      </div>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {group.memberCount} members
                        </span>
                        {group.latestMessage && (
                          <span>Last activity: {format(new Date(group.latestMessage.createdAt), 'MMM d')}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedGroup(group);
                        setIsGroupChatOpen(true);
                      }}
                      size="sm"
                      className="bg-sage hover:bg-sage/90"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {userGroups.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">You haven't joined any groups yet</p>
                  <Button onClick={() => setActiveTab("discover")} className="mt-4 bg-sage hover:bg-sage/90">
                    Discover Groups
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <GroupChatDialog />
      <CreateGroupDialog />
    </div>
  );
}