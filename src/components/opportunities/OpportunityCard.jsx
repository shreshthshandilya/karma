import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Calendar, Building2, Star, Share2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import VolunteerApplicationModal from "./VolunteerApplicationModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OpportunityCard({ opportunity, nonprofitName, nonprofitId }) {
  const categoryColors = {
    education: "bg-blue-100 text-blue-800 border-blue-200",
    environment: "bg-green-100 text-green-800 border-green-200",
    health: "bg-red-100 text-red-800 border-red-200",
    poverty: "bg-yellow-100 text-yellow-800 border-yellow-200",
    animals: "bg-purple-100 text-purple-800 border-purple-200",
    arts_culture: "bg-pink-100 text-pink-800 border-pink-200",
    community_development: "bg-indigo-100 text-indigo-800 border-indigo-200",
    human_rights: "bg-orange-100 text-orange-800 border-orange-200",
    disaster_relief: "bg-red-100 text-red-800 border-red-200",
    elderly_care: "bg-cyan-100 text-cyan-800 border-cyan-200",
    youth_development: "bg-lime-100 text-lime-800 border-lime-200",
    other: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const spotsAvailable = opportunity.volunteers_needed - (opportunity.volunteers_signed_up || 0);
  const isUrgent = spotsAvailable <= 3 && spotsAvailable > 0;
  const isFull = spotsAvailable <= 0;

  const handleShare = async (e) => {
    e.stopPropagation();
    
    const shareText = `Check out this volunteer opportunity: ${opportunity.title} at ${nonprofitName}\n${opportunity.description.substring(0, 100)}...`;
    
    try {
      // Try clipboard first as it's more reliable
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert('Opportunity details copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Opportunity details copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Unable to share at this time. Please try again.');
    }
  };

  return (
    <Card className="group bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] overflow-hidden">
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <Badge className={`${categoryColors[opportunity.category]} border text-xs font-medium bg-white/90`}>
              {opportunity.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            {isUrgent && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs font-medium bg-white/90">
                🔥 Urgent
              </Badge>
            )}
            {isFull && (
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs font-medium bg-white/90">
                Full
              </Badge>
            )}
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">
            {opportunity.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-3 h-3" />
            {nonprofitName}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {opportunity.description}
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-3 h-3" />
              <span className="truncate">{opportunity.time_commitment || "Flexible"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-3 h-3" />
              <span>{spotsAvailable} spots left</span>
            </div>
          </div>

          {opportunity.location?.city && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              {opportunity.location.city}, {opportunity.location.state}
            </div>
          )}

          {opportunity.end_date && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-3 h-3" />
              Apply by {format(new Date(opportunity.end_date), "MMM d, yyyy")}
            </div>
          )}

          {opportunity.skills_needed && opportunity.skills_needed.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {opportunity.skills_needed.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                  {skill}
                </Badge>
              ))}
              {opportunity.skills_needed.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                  +{opportunity.skills_needed.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 space-y-2">
          <VolunteerApplicationModal opportunity={opportunity} nonprofitName={nonprofitName}>
            <Button 
              className={`w-full transition-all duration-300 ${
                isFull 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : isUrgent 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              } text-white border-none shadow-md hover:shadow-lg`}
              disabled={isFull}
            >
              {isFull ? "Opportunity Full" : "Apply to Volunteer"}
            </Button>
          </VolunteerApplicationModal>
          
          <Link to={createPageUrl(`Messages?startConversation=${opportunity.nonprofit_id}`)} className="block">
            <Button 
              variant="outline"
              className="w-full border-teal-400 text-teal-700 hover:bg-teal-50 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Organization
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}