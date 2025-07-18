import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import type { User, JournalEntry } from "@shared/schema";

interface JournalProps {
  userId: number;
  user: User;
}

export default function Journal({ userId, user }: JournalProps) {
  const [entryContent, setEntryContent] = useState("");
  const [isWritingNew, setIsWritingNew] = useState(false);

  const { data: entries = [] } = useQuery({
    queryKey: ["/api/journal", userId],
  });

  const { data: journalPrompt } = useQuery({
    queryKey: ["/api/journal-prompt", userId],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/journal", {
        userId,
        content,
        prompt: journalPrompt?.prompt,
        pregnancyWeek: user.pregnancyWeek,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal", userId] });
      setEntryContent("");
    },
  });

  const handleSaveEntry = () => {
    if (entryContent.trim()) {
      createEntryMutation.mutate(entryContent);
      setIsWritingNew(false);
    }
  };

  const handleNewEntry = () => {
    setIsWritingNew(true);
    setEntryContent("");
    // Scroll to the entry form
    setTimeout(() => {
      const entryForm = document.querySelector('textarea');
      if (entryForm) {
        entryForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        entryForm.focus();
      }
    }, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-deep-teal">My Journal</h3>
        <Button
          onClick={handleNewEntry}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Entry
        </Button>
      </div>

      <div className="space-y-4">
        {/* Today's Prompt */}
        <Card className={`shadow-lg ${isWritingNew ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-3">Today's Prompt</h4>
            <div className="text-gray-600 mb-4">
              {(journalPrompt?.prompt || "What are three things you're grateful for today during your pregnancy journey?").split('\n').map((paragraph, index) => (
                <p key={index} className={index > 0 ? "mt-3" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
            <Textarea
              value={entryContent}
              onChange={(e) => setEntryContent(e.target.value)}
              placeholder="Write your thoughts..."
              className="w-full h-24 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
            />
            <Button
              onClick={handleSaveEntry}
              disabled={!entryContent.trim() || createEntryMutation.isPending}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-deep-teal">Recent Entries</h4>
              <span className="text-sm text-gray-500">
                {user.pregnancyWeek ? `Week ${user.pregnancyWeek}` : "Your Journey"}
              </span>
            </div>
            <div className="space-y-3">
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No journal entries yet</p>
                  <p className="text-sm text-gray-400">Start writing to track your journey!</p>
                </div>
              ) : (
                entries.map((entry: JournalEntry) => (
                  <div key={entry.id} className="border-l-4 border-sage pl-4 py-2">
                    <p className="text-sm text-gray-600 mb-1">
                      {formatDate(entry.createdAt?.toString() || "")}
                    </p>
                    <p className="text-deep-teal line-clamp-3">{entry.content}</p>
                    {entry.prompt && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        Prompt: {entry.prompt}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
