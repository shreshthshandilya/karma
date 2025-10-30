import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Nonprofit } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Building2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [nonprofits, setNonprofits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialNonprofits = async () => {
      try {
        const recentNonprofits = await Nonprofit.list("-created_date", 12);
        setNonprofits(recentNonprofits);
      } catch (error) {
        console.error("Error loading nonprofits:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialNonprofits();
  }, []);

  const categoryColors = {
    education: "bg-blue-100 text-blue-800",
    environment: "bg-green-100 text-green-800",
    health: "bg-red-100 text-red-800",
    poverty: "bg-yellow-100 text-yellow-800",
    animals: "bg-purple-100 text-purple-800",
    arts_culture: "bg-pink-100 text-pink-800",
    community_development: "bg-indigo-100 text-indigo-800"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-800">
      <div className="container mx-auto px-4 py-12 md:py-20 text-center">
        
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Karma
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-light text-gray-700 mb-6">
            Join a community making a difference.
          </p>
          <p className="text-lg text-gray-600 mb-10">
            Are you here to lend a hand, or are you an organization seeking support?
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          <Link to={createPageUrl("Onboarding?type=volunteer")}>
            <Card className="p-8 h-full cursor-pointer hover:shadow-2xl hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold mb-2">I'm a Volunteer or Donor</h3>
              <p className="text-gray-600 mb-4">Find opportunities and support causes you care about.</p>
              <Button variant="ghost" className="text-blue-600 font-semibold">Get Started <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Card>
          </Link>
          <Link to={createPageUrl("Onboarding?type=nonprofit_admin")}>
            <Card className="p-8 h-full cursor-pointer hover:shadow-2xl hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-2xl font-bold mb-2">I Represent a Nonprofit</h3>
              <p className="text-gray-600 mb-4">Recruit volunteers and receive donations for your cause.</p>
              <Button variant="ghost" className="text-indigo-600 font-semibold">Register <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Card>
          </Link>
        </div>

        {/* Impact Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Growing Community of Nonprofits</h2>
          <p className="text-lg text-gray-600 mb-10">Organizations of all sizes are joining Karma to connect with supporters like you.</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {nonprofits.map(org => (
                <div key={org.id} className="text-center group">
                  <Avatar className="h-20 w-20 mx-auto shadow-lg border-2 border-white group-hover:scale-110 transition-transform duration-300">
                    <AvatarImage src={org.logo_url} alt={org.name} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-gray-100 to-gray-200">
                      {org.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="mt-3 font-semibold text-sm truncate">{org.name}</h4>
                  <Badge className={`${categoryColors[org.category] || 'bg-gray-100 text-gray-800'} text-xs mt-1`}>
                    {org.category.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {nonprofits.length > 0 && (
             <div className="mt-12">
                <Link to={createPageUrl("NonprofitsDirectory")}>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">View All Organizations</Button>
                </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}