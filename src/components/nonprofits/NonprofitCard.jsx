import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Users, DollarSign, Building2, Star, Share2 } from "lucide-react";
import DonationModal from "../donations/DonationModal";
import { toast } from "sonner";

export default function NonprofitCard({ nonprofit, onFavoriteToggle }) {
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

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle(nonprofit.id, nonprofit.isFavorited);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareText = `Check out ${nonprofit.name} on Karma - ${nonprofit.description.substring(0, 100)}...`;
    
    try {
      // Try clipboard first as it's more reliable
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert('Nonprofit info copied to clipboard!');
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
        alert('Nonprofit info copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Unable to share at this time. Please try again.');
    }
  };

  const stopPropagation = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const avgRating = nonprofit.avg_rating;
  const reviewsCount = nonprofit.reviews_count;

  return (
    <Card className="h-full bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] transform overflow-hidden flex flex-col">
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
            >
              <Heart className={`w-4 h-4 ${nonprofit.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 truncate">
              {nonprofit.name}
            </h3>
            <Badge className={`${categoryColors[nonprofit.category]} border text-xs font-medium`}>
              {nonprofit.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          {avgRating > 0 && (
            <div className="flex items-center gap-1 text-yellow-500 ml-2 flex-shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm text-gray-800">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({reviewsCount})</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow flex flex-col">
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed flex-grow">
          {nonprofit.description}
        </p>

        <div className="space-y-2">
          {nonprofit.distance !== null && nonprofit.distance !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              {nonprofit.location?.city}, {nonprofit.location?.state}
              <span className="font-semibold text-blue-600 ml-1">({nonprofit.distance.toFixed(1)} mi)</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <DollarSign className="w-3 h-3" />
              <span>${(nonprofit.total_donations_received || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-3 h-3" />
              <span>{nonprofit.volunteers_count || 0} volunteers</span>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="p-6 pt-2">
        <div className="flex gap-2" onClick={stopPropagation}>
          <DonationModal nonprofit={nonprofit}>
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-300">
              <Heart className="w-4 h-4 mr-1" />
              Donate
            </Button>
          </DonationModal>
        </div>
      </div>
    </Card>
  );
}