import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, Star } from "lucide-react";
import type { Expert } from "@shared/schema";

export default function Experts() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

  const { data: experts = [] } = useQuery({
    queryKey: ["/api/experts"],
    queryFn: async () => {
      const response = await fetch("/api/experts");
      return response.json();
    },
  });

  const specialties = [
    { id: "doula", label: "Doulas", color: "bg-sage" },
    { id: "lactation", label: "Lactation", color: "bg-lavender text-deep-teal" },
    { id: "therapy", label: "Therapy", color: "bg-coral" },
    { id: "nutrition", label: "Nutrition", color: "bg-muted-gold" },
  ];

  const filteredExperts = selectedSpecialty
    ? experts.filter((expert: Expert) => expert.specialty === selectedSpecialty)
    : experts;

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-deep-teal">Expert Network</h3>
        <Button variant="ghost" size="sm">
          <Filter size={20} className="text-sage" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Available Now */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">Available Now</h4>
            <div className="space-y-4">
              {filteredExperts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No experts available at the moment</p>
                </div>
              ) : (
                filteredExperts.map((expert: Expert) => (
                  <div
                    key={expert.id}
                    className="flex items-center space-x-4 p-4 bg-warm-gray rounded-xl"
                  >
                    <img
                      src={expert.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"}
                      alt={expert.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-deep-teal">{expert.name}</h5>
                      <p className="text-sm text-gray-600">{expert.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < expert.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {expert.rating}.0 • {expert.reviewCount} reviews
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-sage text-white px-4 py-2 rounded-xl hover:bg-sage/90 transition-colors"
                    >
                      Connect
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="font-semibold text-deep-teal mb-4">Specialties</h4>
            <div className="grid grid-cols-2 gap-3">
              {specialties.map((specialty) => (
                <Button
                  key={specialty.id}
                  variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                  onClick={() => setSelectedSpecialty(
                    selectedSpecialty === specialty.id ? "" : specialty.id
                  )}
                  className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                    selectedSpecialty === specialty.id
                      ? `${specialty.color} text-white hover:opacity-90`
                      : `${specialty.color} text-white hover:opacity-90`
                  }`}
                >
                  {specialty.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
