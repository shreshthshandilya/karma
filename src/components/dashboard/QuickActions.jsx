import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, MessageCircle, Building2, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={createPageUrl("NonprofitsDirectory")}>
            <Button className="w-full h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex flex-col items-center gap-1">
                <Building2 className="w-5 h-5" />
                <span className="text-xs font-medium">Browse Directory</span>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl("Volunteering")}>
            <Button className="w-full h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex flex-col items-center gap-1">
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">Volunteer</span>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl("Donating")}>
            <Button className="w-full h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex flex-col items-center gap-1">
                <DollarSign className="w-5 h-5" />
                <span className="text-xs font-medium">Donate</span>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl("Messages")}>
            <Button className="w-full h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex flex-col items-center gap-1">
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Messages</span>
              </div>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}