
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Building2 } from "lucide-react";
import { Nonprofit } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NearbyNonprofits({ user }) {
  const [nonprofits, setNonprofits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNonprofits();
  }, []);

  const loadNonprofits = async () => {
    try {
      const allNonprofits = await Nonprofit.list("-created_date", 5);
      setNonprofits(allNonprofits);
    } catch (error) {
      // Silently handle error - show empty list
      setNonprofits([]);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    education: "bg-blue-100 text-blue-800",
    environment: "bg-green-100 text-green-800",
    health: "bg-red-100 text-red-800",
    poverty: "bg-yellow-100 text-yellow-800",
    animals: "bg-purple-100 text-purple-800"
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
        <CardHeader>
          <CardTitle>Organizations Near You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-blue-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
      <CardHeader className="border-b border-blue-50">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <MapPin className="w-5 h-5 text-blue-600" />
          Organizations Near You
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {nonprofits.map((nonprofit) => (
            <div key={nonprofit.id} className="p-4 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-blue-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{nonprofit.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {nonprofit.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={categoryColors[nonprofit.category] || "bg-gray-100 text-gray-800"}>
                      {nonprofit.category}
                    </Badge>
                    {nonprofit.location?.city && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {nonprofit.location.city}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={createPageUrl(`NonprofitDetails?id=${nonprofit.id}`)} className="flex-1">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full">
                        <Heart className="w-3 h-3 mr-1" />
                        Support
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-blue-100">
          <Link to={createPageUrl("Donating")}>
            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
              View All Organizations
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
