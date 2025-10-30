
import React, { useState, useEffect } from "react";
import { User, Nonprofit, Opportunity, Donation } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, DollarSign, Clock, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WalletCard from "../components/dashboard/WalletCard";
import RecommendedOpportunities from "../components/dashboard/RecommendedOpportunities";
import PersonalizedRecommendations from "../components/dashboard/PersonalizedRecommendations"; // Added import
import NearbyNonprofits from "../components/dashboard/NearbyNonprofits";
import QuickActions from "../components/dashboard/QuickActions";
import DisasterAlerts from "../components/dashboard/DisasterAlerts"; // Added import

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalNonprofits: 0,
    totalOpportunities: 0,
    totalDonations: 0,
    myDonations: 0,
    myVolunteerHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [userFirstName, setUserFirstName] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setUserFirstName(currentUser.full_name ? currentUser.full_name.split(" ")[0] : "User");

      const [nonprofits, opportunities, donations] = await Promise.all([
        Nonprofit.list(),
        Opportunity.filter({ is_active: true }),
        Donation.list()
      ]);

      const userDonations = donations.filter(d => d.donor_id === currentUser.id);
      const totalUserDonated = userDonations.reduce((sum, d) => sum + d.amount, 0);

      setStats({
        totalNonprofits: nonprofits.length,
        totalOpportunities: opportunities.length,
        totalDonations: donations.length,
        myDonations: totalUserDonated,
        myVolunteerHours: currentUser.total_volunteer_hours || 0
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-blue-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-blue-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="text-center py-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome, {userFirstName}!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing nonprofits, volunteer for causes you care about, and make a lasting impact in your community
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-100">
                  <DollarSign className="w-5 h-5" />
                  Total Donated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.myDonations}</div>
                <p className="text-blue-200 text-sm">Your lifetime giving</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-indigo-100">
                  <Clock className="w-5 h-5" />
                  Hours Volunteered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.myVolunteerHours}</div>
                <p className="text-indigo-200 text-sm">Time well spent</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-100">
                  <Users className="w-5 h-5" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
                <p className="text-purple-200 text-sm">Ways to help</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-pink-100">
                  <Heart className="w-5 h-5" />
                  Nonprofits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalNonprofits}</div>
                <p className="text-pink-200 text-sm">Organizations to support</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DisasterAlerts user={user} />
              <QuickActions />
              <RecommendedOpportunities user={user} />
              <PersonalizedRecommendations user={user} /> {/* Added PersonalizedRecommendations component */}
            </div>
            
            <div className="space-y-8">
              <WalletCard user={user} stats={stats} />
              <NearbyNonprofits user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
