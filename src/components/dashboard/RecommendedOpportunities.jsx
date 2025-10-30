
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Star } from "lucide-react";
import { Opportunity, Nonprofit, Donation, Review } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecommendedOpportunities({ user }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOpportunities = useCallback(async () => {
    try {
      // Fetch all active opportunities, user's donations, and user's reviews concurrently
      const [allOpportunities, userDonations, userReviews] = await Promise.all([
        Opportunity.filter({ is_active: true }),
        user?.id ? Donation.filter({ donor_id: user.id }) : Promise.resolve([]),
        user?.id ? Review.filter({ reviewer_id: user.id }) : Promise.resolve([])
      ]);
      
      // Get nonprofit IDs the user has previously supported (donated, reviewed, or favorited)
      const supportedNonprofitIds = [
        ...new Set([
          ...(userDonations?.map(d => d.nonprofit_id) || []),
          ...(userReviews?.map(r => r.nonprofit_id) || []),
          ...(user?.favorite_nonprofits || [])
        ])
      ];

      // Get categories user has shown interest in (preferred or through donations)
      const interestedCategories = [
        ...(user?.preferred_categories || []),
        ...new Set(userDonations?.map(d => d.category).filter(Boolean) || [])
      ];

      // Score opportunities based on user history and urgency
      const scoredOpportunities = allOpportunities.map(opp => {
        let score = 0;
        
        // Higher score for opportunities in user's preferred or interested categories
        if (interestedCategories.includes(opp.category)) {
          score += 10;
        }
        
        // Higher score for opportunities from nonprofits user has supported before
        if (supportedNonprofitIds.includes(opp.nonprofit_id)) {
          score += 15;
        }
        
        // Higher score for urgent opportunities (fewer spots available)
        const spotsLeft = opp.volunteers_needed - opp.volunteers_signed_up;
        if (spotsLeft <= 3 && spotsLeft > 0) { // Only score if spots are low but still available
          score += 5;
        }
        
        return { ...opp, recommendationScore: score };
      });

      // Sort by recommendation score (descending), then by creation date (newest first)
      const recommended = scoredOpportunities
        .sort((a, b) => {
          if (b.recommendationScore !== a.recommendationScore) {
            return b.recommendationScore - a.recommendationScore;
          }
          // Fallback to creation date if scores are equal
          return new Date(b.created_date) - new Date(a.created_date);
        })
        .slice(0, 3); // Get the top 3 recommended opportunities
      
      setOpportunities(recommended);
    } catch (error) {
      console.error("Error loading opportunities:", error);
    } finally {
      setLoading(false);
    }
  }, [user]); // `user` is a dependency for `loadOpportunities`

  useEffect(() => {
    if (user?.id) { // Only load recommendations if user is logged in
      loadOpportunities();
    } else {
      // If no user, default to not loading or show generic opportunities (or empty state)
      // For now, setting to empty and not loading, as recommendations are user-specific.
      setLoading(false);
      setOpportunities([]); 
    }
  }, [loadOpportunities, user?.id]); // `loadOpportunities` and `user.id` are dependencies for `useEffect`

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
          <CardTitle>Recommended for You</CardTitle>
          <p className="text-sm text-gray-600">Based on your interests and support history</p>
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
          <Star className="w-5 h-5 text-yellow-500" />
          Recommended for You
        </CardTitle>
        <p className="text-sm text-gray-600">Based on your interests and support history</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="p-4 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-blue-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 flex-1">{opportunity.title}</h3>
                <div className="flex gap-2">
                  <Badge className={categoryColors[opportunity.category] || "bg-gray-100 text-gray-800"}>
                    {opportunity.category}
                  </Badge>
                  {opportunity.recommendationScore > 10 && ( // Display "Recommended" badge if score is high
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      ⭐ Recommended
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {opportunity.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {opportunity.time_commitment}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {opportunity.volunteers_needed - opportunity.volunteers_signed_up} spots
                </div>
                {opportunity.location?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {opportunity.location.city}
                  </div>
                )}
              </div>
              
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Apply Now
              </Button>
            </div>
          ))}
        </div>

        {opportunities.length === 0 && !loading && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No opportunities match your interests yet.</p>
            <Link to={createPageUrl("Opportunities")}>
              <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                Browse All Opportunities
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
