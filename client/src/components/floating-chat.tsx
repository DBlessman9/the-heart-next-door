import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  userId: number;
  content: string;
  isFromUser: boolean;
  timestamp: string;
}

export default function FloatingChat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = localStorage.getItem("currentUserId");
  
  // Don't show on onboarding page or if user not logged in
  if (!currentUserId || location === "/onboarding") return null;

  const userId = parseInt(currentUserId);

  // Get contextual greeting based on current page
  const getContextualGreeting = () => {
    const greetings = {
      "/": "Hi mama! How are you feeling today? I'm here whenever you need support.",
      "/checkin": "Ready for your daily check-in? I'm here if you want to talk through how you're feeling.",
      "/journal": "Journaling can be so healing. Want to explore your thoughts together?",
      "/baby": "Learning about your little one's development? I love talking about this exciting journey!",
      "/chat": "I'm so glad you're here. What's on your heart today?",
      "/appointments": "Managing appointments can feel overwhelming. I'm here to help you stay organized.",
      "/experts": "Finding the right support team is so important. Want to talk about what you're looking for?",
      "/resources": "There's so much to learn! I'm here to help you navigate all this information.",
      "/community": "Connection with other mamas can be so powerful. How are you feeling about community?"
    };
    
    return greetings[location as keyof typeof greetings] || greetings["/"];
  };

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat", userId],
    enabled: isExpanded && !!userId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/chat", {
        userId,
        content,
        isFromUser: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId] });
      setMessage("");
    },
  });

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0 || sendMessageMutation.isPending) {
      scrollToBottom();
    }
  }, [messages, sendMessageMutation.isPending]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleToggle}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative"
            style={{
              backgroundColor: 'hsl(146, 27%, 56%)',
              border: '3px solid white'
            }}
          >
            <MessageCircle size={24} className="text-white" />
            {/* Pulsing indicator */}
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-400 rounded-full animate-pulse"></div>
          </Button>
          
          {/* Contextual tooltip */}
          <div className="absolute bottom-full right-0 mb-2 max-w-xs">
            <div className="bg-white rounded-lg shadow-lg border p-3 text-sm text-gray-700 transform transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-medium text-sage">Nia is here</span>
              </div>
              <p>{getContextualGreeting()}</p>
              {/* Arrow pointing down */}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Chat Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20"
            onClick={handleToggle}
          ></div>
          
          {/* Chat Window */}
          <Card className="relative w-full max-w-md h-[600px] flex flex-col shadow-2xl">
            <CardHeader className="pb-3" style={{ backgroundColor: 'hsl(146, 27%, 56%)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle size={16} className="text-sage" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">Nia</CardTitle>
                    <p className="text-white/80 text-sm">Your Digital Doula</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  className="text-white hover:bg-white/20"
                >
                  <X size={18} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="animate-spin text-sage" size={24} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Initial contextual greeting */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
                        <p className="text-sm text-gray-800">{getContextualGreeting()}</p>
                        <span className="text-xs text-gray-500 mt-1 block">Just now</span>
                      </div>
                    </div>

                    {/* Chat messages */}
                    {messages.map((msg: ChatMessage) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"} mb-3`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.isFromUser
                              ? "bg-sage text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span className={`text-xs mt-1 block ${
                            msg.isFromUser ? "text-white/70" : "text-gray-500"
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Loading indicator for new messages */}
                    {sendMessageMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
                          <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            <span className="text-sm text-gray-600">Nia is typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-sage hover:bg-sage/90"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}