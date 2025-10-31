import { useQuery } from "@tanstack/react-query";
import Community from "@/components/community";
import { Loader2 } from "lucide-react";

export default function CommunityPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/users/2"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blush" size={48} />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return <Community userId={user.id} user={user} />;
}