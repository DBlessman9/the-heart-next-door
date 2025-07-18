import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

interface ChatInterfaceProps {
  userId: number;
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat", userId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        content,
        isFromUser: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId] });
      setMessage("");
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-lavender">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sage to-deep-teal rounded-full flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-deep-teal">Nia - Your Digital Doula</h3>
            <p className="text-sm text-gray-600">Online • Always here for you</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 text-sage mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-deep-teal mb-2">
              Welcome to your chat with Nia!
            </h3>
            <p className="text-gray-600">
              I'm here to support you through your pregnancy journey. 
              Ask me anything about your health, feelings, or concerns.
            </p>
          </div>
        )}
        
        {messages.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.isFromUser ? "justify-end" : ""
            }`}
          >
            {!msg.isFromUser && (
              <div className="w-8 h-8 bg-gradient-to-br from-sage to-deep-teal rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={16} />
              </div>
            )}
            
            <div
              className={`rounded-2xl p-4 max-w-xs ${
                msg.isFromUser
                  ? "rounded-tr-sm"
                  : "bg-warm-gray text-deep-teal rounded-tl-sm"
              }`}
              style={msg.isFromUser ? {
                backgroundColor: 'hsl(146, 27%, 56%)',
                color: 'white'
              } : {}}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
            
            {msg.isFromUser && (
              <div className="w-8 h-8 bg-gradient-to-br from-coral to-muted-gold rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-white" size={16} />
              </div>
            )}
          </div>
        ))}
        
        {sendMessageMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-sage to-deep-teal rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white" size={16} />
            </div>
            <div className="bg-warm-gray rounded-2xl rounded-tl-sm p-4 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 bg-white border-t">
        <div className="flex items-center space-x-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-sage focus:border-transparent"
            disabled={sendMessageMutation.isPending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="w-12 h-12 rounded-2xl transition-colors"
            style={{
              backgroundColor: 'hsl(146, 27%, 56%)',
              color: 'white',
              border: 'none',
              cursor: (!message.trim() || sendMessageMutation.isPending) ? 'not-allowed' : 'pointer',
              opacity: (!message.trim() || sendMessageMutation.isPending) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (message.trim() && !sendMessageMutation.isPending) {
                e.target.style.backgroundColor = 'hsl(146, 27%, 50%)';
              }
            }}
            onMouseLeave={(e) => {
              if (message.trim() && !sendMessageMutation.isPending) {
                e.target.style.backgroundColor = 'hsl(146, 27%, 56%)';
              }
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
