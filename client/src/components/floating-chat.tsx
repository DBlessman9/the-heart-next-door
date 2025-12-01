import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { X, Send, Loader2, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function NiaAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  const heartSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  return (
    <div className={`${sizes[size]} rounded-full bg-white border-2 border-red-100 flex items-center justify-center shadow-md flex-shrink-0`}>
      <Heart className={`${heartSizes[size]} text-red-500 fill-red-500`} />
    </div>
  );
}

const quickReplies = [
  "What should I be eating?",
  "I need some support",
  "Tell me about my baby",
  "Help me prepare for birth"
];

export default function FloatingChat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUserId = localStorage.getItem("currentUserId");
  const userId = currentUserId ? parseInt(currentUserId) : null;

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", userId],
    enabled: isExpanded && !!userId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("No user ID");
      return apiRequest("POST", "/api/chat", {
        userId,
        message: content,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0 || sendMessageMutation.isPending) {
      scrollToBottom();
    }
  }, [messages, sendMessageMutation.isPending]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleQuickReply = (reply: string) => {
    if (!sendMessageMutation.isPending) {
      sendMessageMutation.mutate(reply);
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (!currentUserId || location === "/onboarding") return null;

  return (
    <>
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleToggle}
            className="relative group"
            data-testid="button-open-chat"
          >
            <div className="absolute inset-0 bg-red-400 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-4 border-pink-200">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleToggle}
          />
          
          <div className="relative w-full sm:max-w-md h-full sm:h-[600px] sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col bg-white">
            <div className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <NiaAvatar size="lg" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">Nia</h2>
                  <p className="text-white/80 text-sm">Your Digital Doula</p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                data-testid="button-close-chat"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-gradient-to-b from-pink-50/50 to-white">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4 min-h-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="animate-spin text-pink-400" size={28} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                      <NiaAvatar size="lg" />
                      <h3 className="text-gray-800 font-medium mt-4 mb-2">Hey there! 💕</h3>
                      <p className="text-gray-500 text-center text-sm max-w-[250px] leading-relaxed">
                        I'm Nia, your digital doula. I'm here whenever you need support, guidance, or just someone to talk to.
                      </p>
                      
                      <div className="mt-6 w-full space-y-2">
                        <p className="text-xs text-gray-400 text-center mb-3">Try asking...</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quickReplies.map((reply) => (
                            <button
                              key={reply}
                              onClick={() => handleQuickReply(reply)}
                              className="px-4 py-2 bg-white border border-pink-200 rounded-full text-sm text-gray-700 hover:bg-pink-50 hover:border-pink-300 transition-all shadow-sm"
                              data-testid={`quick-reply-${reply.slice(0, 10)}`}
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg: ChatMessage, index: number) => (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 animate-fade-in ${msg.isFromUser ? "justify-end" : "justify-start"}`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {!msg.isFromUser && <NiaAvatar size="sm" />}
                          
                          <div
                            className={`max-w-[75%] px-4 py-3 ${
                              msg.isFromUser
                                ? "bg-gradient-to-br from-pink-400 to-pink-500 text-white rounded-2xl rounded-br-md shadow-md"
                                : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <span className={`text-xs mt-1.5 block ${
                              msg.isFromUser ? "text-white/70" : "text-gray-400"
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      ))}

                      {sendMessageMutation.isPending && (
                        <div className="flex items-end gap-2 animate-fade-in">
                          <NiaAvatar size="sm" />
                          <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                            <TypingIndicator />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message Nia..."
                    className="w-full h-12 px-5 rounded-full bg-gray-50 border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 focus:outline-none text-gray-800 placeholder-gray-400 transition-all"
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-chat-message"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </Button>
              </form>
              
              <p className="text-center text-xs text-gray-400 mt-3">
                Nia provides support, not medical advice
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
