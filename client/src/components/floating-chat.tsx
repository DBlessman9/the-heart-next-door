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
  const userId = currentUserId ? parseInt(currentUserId) : null;

  // Get contextual greeting based on current page
  const getContextualGreeting = () => {
    const greetings = {
      "/": "Hi there! How are you feeling today? I'm here whenever you need support.",
      "/checkin": "Ready for your daily check-in? I'm here if you want to talk through how you're feeling.",
      "/journal": "Journaling can be so healing. Want to explore your thoughts together?",
      "/baby": "Learning about your little one's development? I love talking about this exciting journey!",
      "/chat": "I'm so glad you're here. What's on your heart today?",
      "/appointments": "Managing appointments can feel overwhelming. I'm here to help you stay organized.",
      "/experts": "Finding the right support team is so important. Want to talk about what you're looking for?",
      "/resources": "There's so much to learn! I'm here to help you navigate all this information.",
      "/community": "Connection with others can be so powerful. How are you feeling about community?"
    };
    
    return greetings[location as keyof typeof greetings] || greetings["/"];
  };

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat", userId],
    enabled: isExpanded && !!userId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("No user ID");
      return apiRequest("POST", "/api/chat", {
        userId,
        content,
        isFromUser: true,
      });
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["/api/chat", userId] });
      }
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

  // Don't show on onboarding page or if user not logged in
  if (!currentUserId || location === "/onboarding") return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleToggle}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              backgroundColor: 'hsl(146, 27%, 56%)',
              border: '3px solid white'
            }}
          >
            <MessageCircle size={24} className="text-white" />
          </Button>
        </div>
      )}

      {/* Expanded Chat Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20"
            onClick={handleToggle}
          ></div>
          
          {/* Chat Window */}
          <Card className="relative w-full max-w-md h-[480px] flex flex-col shadow-2xl">
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

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="animate-spin text-sage" size={24} />
                  </div>
                ) : (
                  <div className="space-y-3 pb-4 min-h-[200px]">
                    {/* Chat messages */}
                    {messages.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Start a conversation with Nia
                      </div>
                    )}
                    {messages.map((msg: ChatMessage) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-lg ${
                            msg.isFromUser
                              ? "text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                          style={{
                            backgroundColor: msg.isFromUser ? 'hsl(146, 27%, 56%)' : undefined
                          }}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <span className={`text-xs mt-2 block ${
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
                        <div className="max-w-[85%] p-3 rounded-lg bg-gray-100">
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
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="border-t border-gray-200 p-4 bg-white shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to Nia..."
                  className="flex-1 border-gray-300 focus:border-sage focus:ring-sage"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="px-4"
                  style={{
                    backgroundColor: 'hsl(146, 27%, 56%)',
                    color: 'white'
                  }}
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}