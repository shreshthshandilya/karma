
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Building2, Star, TrendingUp } from "lucide-react";
import { Nonprofit, Donation, Review } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DonationModal from "../donations/DonationModal";

export default function PersonalizedRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    try {
      const [allNonprofits, userDonations, userReviews, allReviews] = await Promise.all([
        Nonprofit.list(),
        Donation.filter({ donor_id: user.id }),
        Review.filter({ reviewer_id: user.id }),
        Review.list()
      ]);

      // Get nonprofits user has previously supported
      const supportedNonprofitIds = [
        ...new Set([
          ...(userDonations?.map(d => d.nonprofit_id) || []),
          ...(userReviews?.map(r => r.nonprofit_id) || []),
          ...(user?.favorite_nonprofits || [])
        ])
      ];

      // Get categories user has shown interest in
      const interestedCategories = [
        ...(user?.preferred_categories || []),
        ...new Set(userDonations?.map(d => d.category).filter(Boolean) || [])
      ];

      // Calculate average ratings for each nonprofit
      const nonprofitsWithRatings = allNonprofits.map(org => {
        const orgReviews = allReviews.filter(r => r.nonprofit_id === org.id);
        const avgRating = orgReviews.length > 0
          ? orgReviews.reduce((sum, r) => sum + r.rating, 0) / orgReviews.length
          : 0;

        return {
          ...org,
          reviews_count: orgReviews.length,
          avg_rating: avgRating
        };
      });

      // Score nonprofits based on user preferences and history
      const scoredNonprofits = nonprofitsWithRatings
        .filter(org => !supportedNonprofitIds.includes(org.id)) // Exclude already supported
        .map(org => {
          let score = 0;
          
          // Higher score for preferred categories
          if (interestedCategories.includes(org.category)) {
            score += 10;
          }
          
          // Higher score for highly rated organizations
          if (org.avg_rating >= 4.5) {
            score += 8;
          } else if (org.avg_rating >= 4.0) {
            score += 5;
          }
          
          // Higher score for organizations with many reviews (trustworthy)
          if (org.reviews_count >= 10) {
            score += 3;
          }
          
          // Small bonus for newer organizations to give them visibility
          const daysOld = (Date.now() - new Date(org.created_date)) / (1000 * 60 * 60 * 24);
          if (daysOld <= 30) {
            score += 2;
          }
          
          return { ...org, recommendationScore: score };
        });

      // Sort by recommendation score and take top 3
      const recommended = scoredNonprofits
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 3);

      setRecommendations(recommended);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]); // 'user' is a dependency because its properties (id, favorite_nonprofits, preferred_categories) are used inside loadRecommendations

  useEffect(() => {
    if (user?.id) {
      loadRecommendations();
    } else {
      setLoading(false);
    }
  }, [loadRecommendations, user?.id]); // 'loadRecommendations' is a dependency because it's a memoized function, 'user?.id' is a dependency for the conditional check

  const categoryColors = {
    education: "bg-blue-100 text-blue-800",
    environment: "bg-green-100 text-green-800",
    health: "bg-red-100 text-red-800",
    poverty: "bg-yellow-100 text-yellow-800",
    animals: "bg-purple-100 text-purple-800",
    arts_culture: "bg-pink-100 text-pink-800",
    community_development: "bg-indigo-100 text-indigo-800",
    human_rights: "bg-orange-100 text-orange-800",
    disaster_relief: "bg-red-100 text-red-800",
    elderly_care: "bg-cyan-100 text-cyan-800",
    youth_development: "bg-lime-100 text-lime-800",
    other: "bg-gray-100 text-gray-800"
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
        <CardHeader>
          <CardTitle>Recommended Organizations</CardTitle>
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
          <TrendingUp className="w-5 h-5 text-green-500" />
          Recommended Organizations
        </CardTitle>
        <p className="text-sm text-gray-600">Based on your donation history and interests</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {recommendations.map((nonprofit) => (
            <div key={nonprofit.id} className="p-4 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-blue-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{nonprofit.name}</h3>
                    {nonprofit.avg_rating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{nonprofit.avg_rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({nonprofit.reviews_count})</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {nonprofit.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={categoryColors[nonprofit.category] || "bg-gray-100 text-gray-800"}>
                      {nonprofit.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    {nonprofit.recommendationScore > 10 && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        ⭐ Perfect Match
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <DonationModal nonprofit={nonprofit}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Heart className="w-3 h-3 mr-1" />
                        Donate
                      </Button>
                    </DonationModal>
                    <Link to={createPageUrl(`NonprofitDetails?id=${nonprofit.id}`)}>
                      <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Start donating and volunteering to get personalized recommendations!</p>
            <Link to={createPageUrl("Nonprofits")}>
              <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                Explore Organizations
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
