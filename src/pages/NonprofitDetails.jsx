import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Nonprofit, Review, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, Phone, Mail, MessageCircle, AlertTriangle } from "lucide-react";
import DonationModal from "../components/donations/DonationModal";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewForm from "../components/reviews/ReviewForm";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NonprofitDetailsPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const nonprofitId = params.get('id');
  
  const [nonprofit, setNonprofit] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadData = useCallback(async () => {
    if (!nonprofitId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nonprofitData, reviewsData, currentUser] = await Promise.all([
        Nonprofit.get(nonprofitId),
        Review.filter({ nonprofit_id: nonprofitId }, "-created_date"),
        User.me().catch(() => null)
      ]);
      setNonprofit(nonprofitData);
      setReviews(reviewsData);
      setIsLoggedIn(!!currentUser);
    } catch (error) {
      console.error("Error loading nonprofit details:", error);
    } finally {
      setLoading(false);
    }
  }, [nonprofitId]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleReviewSubmitted = () => {
    loadData();
  };
  
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!nonprofit) {
    return <div className="p-8">Nonprofit not found.</div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
          <CardHeader className="text-center">
            {nonprofit.logo_url && <img src={nonprofit.logo_url} alt={`${nonprofit.name} logo`} className="w-24 h-24 mx-auto mb-4 rounded-full" />}
            <h1 className="text-4xl font-bold text-gray-900">{nonprofit.name}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{nonprofit.mission_statement}</p>
            <div className="flex justify-center items-center gap-4 mt-4">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm">
                {nonprofit.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              {avgRating > 0 && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg text-gray-800">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Actions Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
          <CardHeader>
            <CardTitle>Get Involved</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DonationModal nonprofit={nonprofit}>
              <Button className="w-full h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-300">
                Donate Now
              </Button>
            </DonationModal>
            
            <Link to={createPageUrl(`Messages?startConversation=${nonprofit.id}`)} className="w-full">
              <Button className="w-full h-16 text-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-300">
                <MessageCircle className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* About and Contact */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
            <CardHeader><CardTitle>About Us</CardTitle></CardHeader>
            <CardContent><p className="text-gray-700">{nonprofit.description}</p></CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
            <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600"/> {nonprofit.location?.city}, {nonprofit.location?.state}</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600"/> <a href={nonprofit.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{nonprofit.website}</a></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600"/> <a href={`mailto:${nonprofit.contact_email}`} className="hover:underline">{nonprofit.contact_email}</a></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600"/> {nonprofit.phone}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Reviews Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-bold">{avgRating.toFixed(1)} out of 5</span>
                <span className="text-gray-600">({reviews.length} reviews)</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoggedIn ? (
              <ReviewForm nonprofitId={nonprofitId} onSubmit={handleReviewSubmitted} />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login to review</AlertTitle>
                <AlertDescription>
                  You must be logged in to leave a review for this organization.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map(review => <ReviewCard key={review.id} review={review} />)
              ) : (
                <p className="text-center text-gray-500 py-4">No reviews yet. Be the first to leave one!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}