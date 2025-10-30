import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Award } from "lucide-react";

export default function WalletCard({ user, stats }) {
  const getAchievementLevel = (amount) => {
    if (amount >= 1000) return { level: "Philanthropist", color: "bg-yellow-500", icon: "🏆" };
    if (amount >= 500) return { level: "Generous", color: "bg-purple-500", icon: "💎" };
    if (amount >= 100) return { level: "Supporter", color: "bg-blue-500", icon: "⭐" };
    if (amount >= 25) return { level: "Helper", color: "bg-green-500", icon: "🌟" };
    return { level: "Starter", color: "bg-gray-500", icon: "🌱" };
  };

  const achievement = getAchievementLevel(stats.myDonations);

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="border-b border-blue-100">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Wallet className="w-5 h-5 text-blue-600" />
          Your Impact Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ${stats.myDonations}
          </div>
          <p className="text-gray-600">Total Donated</p>
        </div>

        <div className="flex items-center justify-center">
          <Badge className={`${achievement.color} text-white px-4 py-2 text-sm font-semibold`}>
            {achievement.icon} {achievement.level}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Volunteer Hours</span>
            <span className="font-semibold">{stats.myVolunteerHours}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Organizations Helped</span>
            <span className="font-semibold">{user?.favorite_nonprofits?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Donations Made</span>
            <span className="font-semibold">{stats.totalDonations}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-blue-100">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Impact Growing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}